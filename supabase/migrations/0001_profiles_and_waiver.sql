-- Phase 2: guest profiles + waiver click-through audit trail

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'revoked')),
  role text not null default 'guest' check (role in ('guest', 'admin')),
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_approved()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and status = 'approved'
  );
$$;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_self"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin());

-- Guests can edit their own contact details, but only an admin can change
-- status/role/approval fields -- enforced here since RLS can't restrict
-- column-level writes on its own.
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() is null when run outside a PostgREST/RLS request (e.g. the
  -- Supabase SQL Editor, the CLI, or service_role) -- treat that as a
  -- trusted administrative context, since a real guest session always has
  -- a uid and must go through is_admin() instead.
  if auth.uid() is not null and not public.is_admin() then
    if new.status is distinct from old.status
       or new.role is distinct from old.role
       or new.approved_by is distinct from old.approved_by
       or new.approved_at is distinct from old.approved_at
       or new.revoked_at is distinct from old.revoked_at
    then
      raise exception 'Only an admin can change profile status, role, or approval fields';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_privileged_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

-- Auto-create a pending profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Waiver versions: immutable text per version, exactly one active at a time.
create table public.waiver_versions (
  id uuid primary key default gen_random_uuid(),
  version_label text not null,
  body_markdown text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index waiver_versions_one_active
  on public.waiver_versions (is_active)
  where is_active;

alter table public.waiver_versions enable row level security;

create policy "waiver_versions_select_authenticated"
  on public.waiver_versions for select
  to authenticated
  using (is_active or public.is_admin());

create policy "waiver_versions_admin_write"
  on public.waiver_versions for all
  using (public.is_admin())
  with check (public.is_admin());

-- Waiver acceptances: append-only audit trail, never updated or deleted
-- by client roles.
create table public.waiver_acceptances (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  waiver_version_id uuid not null references public.waiver_versions (id),
  typed_signature_name text not null,
  accepted_at timestamptz not null default now(),
  ip_address inet not null,
  user_agent text,
  unique (profile_id, waiver_version_id)
);

alter table public.waiver_acceptances enable row level security;

create policy "waiver_acceptances_select_own_or_admin"
  on public.waiver_acceptances for select
  using (profile_id = auth.uid() or public.is_admin());

create policy "waiver_acceptances_insert_own_active_version"
  on public.waiver_acceptances for insert
  with check (
    profile_id = auth.uid()
    and waiver_version_id = (select id from public.waiver_versions where is_active)
  );

-- Seed the initial waiver version. Reconstructed from the provided
-- tracked-changes document -- have this reviewed by counsel before
-- real guests sign it, then update via the admin waiver page.
insert into public.waiver_versions (version_label, body_markdown, is_active)
values (
  '2026-07-initial',
  $md$# RELEASE, WAIVER OF LIABILITY, ASSUMPTION OF RISK, AND INDEMNITY AGREEMENT

The individual named below (referred to as "I" or "me" or the "Visitor") desires to enter the property owned by Dr. Zachariah Zachariah (the "Owner"), known as Sandy Acres Ranch, located at 31550 Washington Loop Road, Punta Gorda, FL 33982 (the "Property"). As used herein, "Releasees" means the Owner and each of the Owner's family members, heirs, successors, assigns, affiliates, employees, agents, contractors, representatives, and any other persons or entities acting on the Owner's behalf, individually and collectively. In consideration of being permitted by the Owner to enter the Property and participate in any and all recreational, social, educational, or other activities on the Property, whether organized or unorganized, supervised or unsupervised (collectively, the "Activities"), and in recognition of the Owner's reliance hereon, I agree to all of the following terms and conditions:

**ACKNOWLEDGMENT AND ASSUMPTION OF RISK.** I AM AWARE AND UNDERSTAND THAT ACCESSING THE PROPERTY AND PARTICIPATING IN ACTIVITIES IS INHERENTLY DANGEROUS AND MAY INVOLVE THE RISK OF SERIOUS INJURY, DISABILITY, DEATH, AND/OR PROPERTY DAMAGE. I ACKNOWLEDGE THAT SUCH RISKS INCLUDE, WITHOUT LIMITATION, ALL HAZARDS WHETHER KNOWN OR UNKNOWN, INHERENT OR LATENT, FORESEEABLE OR UNFORESEEABLE, INCLUDING BUT NOT LIMITED TO RISKS ARISING FROM THE CONDITION OF THE PROPERTY, WILDLIFE, WEATHER, TERRAIN, EQUIPMENT, THE ACTIONS OR OMISSIONS OF OTHER PERSONS ON THE PROPERTY, AND THE ORDINARY NEGLIGENCE OF THE OWNER OR ANY RELEASEE, INCLUDING NEGLIGENT EMERGENCY RESPONSE OR RESCUE OPERATIONS OF THE OWNER. NOTWITHSTANDING THESE RISKS, I ACKNOWLEDGE THAT I AM VOLUNTARILY ACCESSING THE PROPERTY AND PARTICIPATING IN ACTIVITIES WITH FULL KNOWLEDGE OF ALL DANGERS INVOLVED AND HEREBY AGREE TO ACCEPT AND ASSUME ANY AND ALL RISKS OF INJURY, DISABILITY, DEATH, AND/OR PROPERTY DAMAGE ARISING THEREFROM, WHETHER CAUSED BY THE ORDINARY NEGLIGENCE OF THE OWNER OR ANY RELEASEE OR OTHERWISE. THIS ASSUMPTION OF RISK SHALL SURVIVE MY DEATH OR INCAPACITY AND SHALL BE BINDING UPON MY HEIRS, ESTATE, PERSONAL REPRESENTATIVES, AND ASSIGNS.

**RELEASE AND WAIVER OF LIABILITY.** I HEREBY EXPRESSLY WAIVE AND RELEASE ANY AND ALL CLAIMS, DEMANDS, CAUSES OF ACTION, LOSSES, DAMAGES, LIABILITIES, COSTS, AND EXPENSES OF EVERY KIND AND NATURE, WHETHER NOW KNOWN OR HEREAFTER DISCOVERED OR ASCERTAINED, AGAINST THE OWNER AND ALL OTHER RELEASEES, ON ACCOUNT OF OR ARISING OUT OF INJURY, DISABILITY, DEATH, OR PROPERTY DAMAGE ARISING OUT OF OR IN ANY WAY ATTRIBUTABLE TO MY PRESENCE ON THE PROPERTY OR PARTICIPATION IN ACTIVITIES, WHETHER ARISING OUT OF THE ORDINARY NEGLIGENCE OF THE OWNER OR ANY RELEASEE OR OTHERWISE. I COVENANT NOT TO MAKE OR BRING ANY SUCH CLAIM AGAINST THE OWNER OR ANY OTHER RELEASEE, AND FOREVER RELEASE AND DISCHARGE THE OWNER AND ALL OTHER RELEASEES FROM ANY AND ALL LIABILITY UNDER SUCH CLAIMS. THIS WAIVER AND RELEASE SHALL SURVIVE MY DEATH OR INCAPACITY AND SHALL BE BINDING UPON MY HEIRS, ESTATE, EXECUTORS, ADMINISTRATORS, PERSONAL REPRESENTATIVES, AND ASSIGNS. This waiver and release does not extend to claims arising from the gross negligence or willful misconduct of the Owner or any Releasee, or to any other liabilities that Florida law does not permit to be released by agreement.

**INDEMNIFICATION.** I shall defend, indemnify, and hold harmless the Owner and all other Releasees against any and all claims, demands, causes of action, losses, damages, liabilities, deficiencies, actions, judgments, settlements, interest, awards, penalties, fines, costs, or expenses of whatever kind, including reasonable attorneys' fees, expert witness fees, court costs, the costs of enforcing any right to indemnification under this Release, and the cost of pursuing any insurance providers (collectively, "Losses"), incurred by or asserted against the Owner or any other Releasee in a final non-appealable judgment arising out of or resulting from (a) my presence on the Property or participation in Activities, (b) any claim of a third party related to my presence on the Property or participation in Activities, or (c) any breach of this Release by me. This indemnification obligation shall apply regardless of any alleged negligence of the Owner or any Releasee, except that it shall not apply to the extent that Losses are finally determined by a court of competent jurisdiction to have resulted from the gross negligence or willful misconduct of the Owner or such Releasee. I shall reimburse the Owner and any Releasee for all defense costs, including attorneys' fees and expert fees, as they are incurred and upon written demand, without regard to the final outcome of any proceeding. This indemnification obligation shall survive my death or incapacity and shall be binding upon my heirs, estate, personal representatives, and assigns.

**COMPLIANCE WITH INSTRUCTIONS.** I agree that while on the Property I will comply with all posted rules, warnings, and safety guidelines and will follow all instructions of any onsite property manager, representative, agent, or other authorized person acting on behalf of the Owner. I acknowledge that failure to comply with such rules, warnings, guidelines, or instructions may result in my immediate removal from the Property without liability to the Owner or any Releasee.

**MEDICAL CONSENT AND RELEASE.** I hereby consent to receive medical treatment deemed necessary if I am injured or require medical attention while on the Property. I understand and agree that I am solely responsible for all costs related to such medical treatment and any related medical transportation, evacuation, and/or follow-up care. I hereby release, forever discharge, and hold harmless the Owner and all other Releasees from any claim whatsoever arising out of or related to such treatment, medical decisions, or other medical services, whether provided by the Owner, any Releasee, or any third party.

**WAIVER OF JURY TRIAL.** TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, I AND THE OWNER EACH HEREBY IRREVOCABLY AND UNCONDITIONALLY WAIVE ANY AND ALL RIGHTS TO A TRIAL BY JURY IN ANY ACTION, PROCEEDING, OR COUNTERCLAIM ARISING OUT OF OR RELATING TO THIS RELEASE, MY PRESENCE ON THE PROPERTY, OR MY PARTICIPATION IN ACTIVITIES. THIS WAIVER SHALL APPLY TO ANY AND ALL CLAIMS ASSERTED BY OR AGAINST THE OWNER OR ANY RELEASEE.

**ATTORNEYS' FEES AND COSTS.** In any action, proceeding, or arbitration arising out of or relating to this Release, the prevailing party shall be entitled to recover from the non-prevailing party all reasonable attorneys' fees, expert witness fees, court costs, arbitration fees, and other costs and expenses incurred in connection therewith, in addition to any other relief to which such prevailing party may be entitled.

**SHORTENED LIMITATIONS PERIOD.** TO THE FULLEST EXTENT PERMITTED BY FLORIDA LAW, ANY CLAIM OR CAUSE OF ACTION ARISING OUT OF OR RELATING TO THIS RELEASE, MY PRESENCE ON THE PROPERTY, OR MY PARTICIPATION IN ACTIVITIES MUST BE COMMENCED WITHIN ONE (1) YEAR FROM THE DATE OF THE INCIDENT GIVING RISE TO SUCH CLAIM OR CAUSE OF ACTION. FAILURE TO COMMENCE ANY SUCH CLAIM OR CAUSE OF ACTION WITHIN SUCH ONE-YEAR PERIOD SHALL CONSTITUTE AN ABSOLUTE BAR AND WAIVER OF SUCH CLAIM OR CAUSE OF ACTION.

**DISPUTE RESOLUTION.** Any dispute, controversy, or claim arising out of or relating to this Release, my presence on the Property, or my participation in Activities shall first be submitted to non-binding mediation administered by a mutually agreed-upon mediator in Charlotte County, Florida. If the dispute is not resolved within thirty (30) days after the commencement of mediation (or such longer period as the parties may agree in writing), the dispute shall be finally resolved by binding arbitration administered in Charlotte County, Florida, in accordance with the rules of the American Arbitration Association then in effect. The arbitration shall be conducted by a single arbitrator and governed by the laws of the State of Florida. The arbitrator's award shall be final and binding and may be entered as a judgment in any court of competent jurisdiction. The costs of mediation shall be shared equally by the parties; the costs of arbitration, including the arbitrator's fees, shall be allocated by the arbitrator in the final award. This Section shall survive the termination or expiration of this Release.

**PHOTO AND PUBLICITY RELEASE.** I hereby grant to the Owner and all Releasees the irrevocable right and permission to photograph, film, record, or otherwise capture my image, likeness, voice, and/or statements (collectively, "Images") during my presence on the Property or participation in Activities, and to use, reproduce, distribute, display, and publish such Images in any media now known or hereafter developed, for promotional, marketing, educational, or any other lawful purpose, without compensation, notice, or further consent from me. I waive any right to inspect or approve any such use of my Images and release the Owner and all Releasees from any claims arising out of such use, including but not limited to claims for invasion of privacy, defamation, or right of publicity.

**ACKNOWLEDGMENT OF OPPORTUNITY FOR INDEPENDENT LEGAL ADVICE.** I acknowledge and represent that I have had a reasonable and sufficient opportunity to consult with independent legal counsel of my own choosing regarding the meaning, effect, and consequences of this Release prior to signing it. Whether or not I have actually consulted with legal counsel, I acknowledge that I am signing this Release voluntarily, of my own free will, and with full knowledge and understanding of its terms and legal effect.

**GENERAL PROVISIONS.**

(a) *Severability.* If any term, provision, or portion of this Release is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such invalidity, illegality, or unenforceability shall not affect any other term or provision of this Release, and the remaining terms and provisions shall continue in full force and effect. To the extent permitted by applicable law, any invalid, illegal, or unenforceable provision shall be modified or reformed by such court to the minimum extent necessary to make it valid, legal, and enforceable while preserving the original intent of the parties.

(b) *Entire Agreement; Amendments.* This Release constitutes the sole and entire agreement between the Owner and me with respect to the subject matter contained herein and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, with respect to such subject matter. No amendment, modification, or waiver of any provision of this Release shall be effective unless made in writing and signed by both the Owner and me.

(c) *Governing Law.* All matters arising out of or relating to this Release shall be governed by and construed in accordance with the internal laws of the State of Florida, without giving effect to any choice or conflict of law provision or rule (whether of the State of Florida or any other jurisdiction).

(d) *Binding Effect; Survival.* This Release is binding on and shall inure to the benefit of the Owner and me and our respective successors, assigns, heirs, executors, administrators, and personal representatives. All obligations, releases, waivers, indemnities, and covenants contained herein shall survive the completion of Activities, my departure from the Property, and my death or incapacity, and shall remain in full force and effect in perpetuity.

(e) *No Waiver.* The failure of the Owner or any Releasee to enforce any provision of this Release shall not constitute a waiver of such provision or the right to enforce it at a later time.

(f) *Voluntary Execution.* I represent and warrant that I am of legal age and am competent to enter into this Release, that I have read this Release in its entirety, that I fully understand all of its terms and conditions, and that I am signing this Release voluntarily and of my own free will, without duress or coercion of any kind.

**BY ACCEPTING BELOW, I ACKNOWLEDGE THAT I HAVE CAREFULLY READ AND FULLY UNDERSTOOD ALL OF THE TERMS AND CONDITIONS OF THIS RELEASE, INCLUDING THE RELEASE AND WAIVER OF LIABILITY, ASSUMPTION OF RISK, INDEMNIFICATION, JURY TRIAL WAIVER, SHORTENED LIMITATIONS PERIOD, DISPUTE RESOLUTION, AND PHOTO AND PUBLICITY RELEASE PROVISIONS. I UNDERSTAND THAT BY ACCEPTING THIS RELEASE I AM VOLUNTARILY GIVING UP SUBSTANTIAL LEGAL RIGHTS, INCLUDING THE RIGHT TO SUE THE OWNER AND ALL OTHER RELEASEES AND THE RIGHT TO A TRIAL BY JURY. I ACCEPT THIS RELEASE FREELY AND VOLUNTARILY, WITHOUT INDUCEMENT, ASSURANCE, OR GUARANTEE BEING MADE TO ME.**
$md$,
  true
);

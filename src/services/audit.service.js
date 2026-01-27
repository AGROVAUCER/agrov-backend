import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function logAudit({
  actorRole,
  actorUserId,
  action,
  targetType,
  targetId,
  payload = {}
}) {
  await supabase.from('audit_logs').insert([{
    actor_role: actorRole,
    actor_user_id: actorUserId,
    action,
    target_type: targetType,
    target_id: targetId,
    payload
  }]);
}

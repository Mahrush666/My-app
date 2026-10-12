# Supabase connectivity trial

Project WordQuest (Singapore), ref lzsljehuuezdlssrgzwe. Keep the existing Cloudflare data and classroom-config.json unchanged until the teacher confirms successful WeChat tests without VPN.

The connection-check Edge Function retains gateway JWT verification. The browser uses the public legacy anon JWT for this harmless probe, and a publishable key for Auth/Data API checks. No secret/service-role key is used. The probe accesses no tables or student data and allows the production GitHub Pages origin only.

The separate ?supabase-test=1 route checks configuration, Auth health, database gateway (expected 404/PGRST205 for a deliberately absent test table; this proves reachability, not data access), and Edge Function GET and JSON POST. Unexpected HTTP errors and timeouts are failures. Passing this trial does not validate actual homework login, RLS, or media delivery; those must be tested before migration.

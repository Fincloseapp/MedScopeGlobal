-- V5: Groq free AI engine documentation seed (additive)

insert into public.documentation (version, content, admin_only)
values (
  'v5',
  'V5 Groq Engine: GROQ_API_KEY (gsk_) primární LLM — llama3-70b → mixtral → gemma2 → Gemini → OpenAI. Používá AI Medical Intelligence, V4d medical-ai-fetch, ingest, v4c extract.',
  false
)
on conflict (version) do nothing;

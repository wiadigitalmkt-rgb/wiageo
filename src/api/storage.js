import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'wiageo-fotos';

// Compatível com api.integrations.Core.UploadFile({ file }) -> { file_url }
async function UploadFile({ file }) {
  const ext = file.name.split('.').pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { file_url: data.publicUrl };
}

export const integrations = {
  Core: { UploadFile },
};

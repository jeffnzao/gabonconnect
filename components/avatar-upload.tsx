"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { updateAvatarAction } from "@/app/actions/user";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";

// Initialisation du client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AvatarUpload({
  userId,
  currentImage,
}: {
  userId: string;
  currentImage?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // 1. Nom de fichier unique
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // 2. Upload dans le bucket "avatars" de Supabase
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 3. Récupération de l'URL publique
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 4. Mise à jour en base de données
      const res = await updateAvatarAction(userId, publicUrl);
      if (res.success) {
        setPreview(publicUrl);
      }
    } catch (err) {
      alert("Erreur lors du téléversement de l'image.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
        {preview ? (
          <Image src={preview} alt="Avatar" fill className="object-cover" />
        ) : (
          <span className="text-xl font-bold text-slate-400">GC</span>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <label className="cursor-pointer flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition">
        <Camera className="w-4 h-4" />
        <span>Changer la photo</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
        />
      </label>
    </div>
  );
}
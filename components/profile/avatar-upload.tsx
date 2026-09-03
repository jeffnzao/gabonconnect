"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { updateAvatarAction } from "@/app/profile/actions";
import { Camera, Loader2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AvatarUploadProps {
  userId: string;
  currentPhoto?: string | null;
  initials: string;
}

export default function AvatarUpload({
  userId,
  currentPhoto,
  initials,
}: AvatarUploadProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Upload dans le bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Récupération de l'URL publique
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Mise à jour du profil
      const res = await updateAvatarAction(publicUrl);
      if (res?.success) {
        setPreview(publicUrl);
      }
    } catch (err) {
      alert("Erreur lors de l'envoi de l'image.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group flex items-center justify-center">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Avatar"
          className="h-20 w-20 shrink-0 rounded-full object-cover border border-slate-200"
        />
      ) : (
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl font-semibold text-emerald-600">
          {initials}
        </span>
      )}

      {loading && (
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        </div>
      )}

      <label className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full cursor-pointer hover:bg-emerald-600 transition shadow-md">
        <Camera className="w-3.5 h-3.5" />
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
"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { uploadImage } from "@/actions/user/uploadImage";
import {
  startGeneration,
  getGenerationStatus,
  getGeneratedContent,
  updatePost,
} from "@/actions/user/aiGeneration";

type Phase = "idle" | "generating" | "draft" | "error";

export default function PostGenerator() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [prompt, setPrompt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [tone, setTone] = useState("Professional");
  const [postId, setPostId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [title, setTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    let uploadedUrl = coverImageUrl;

    if (coverImageFile) {
      const fd = new FormData();
      fd.set("image", coverImageFile);
      try {
        const result = await uploadImage(fd);
        uploadedUrl = result.url;
        setCoverImageUrl(result.url);
      } catch {
        setErrorMessage("Failed to upload cover image");
        setPhase("error");
        return;
      }
    }

    setPhase("generating");
    setStatusText("Starting generation…");
    setErrorMessage("");

    try {
      const { postId: id } = await startGeneration({
        prompt: prompt.trim(),
        tone,
        coverImageUrl: uploadedUrl || undefined,
      });
      setPostId(id);

      const poll = async () => {
        const status = await getGenerationStatus(id);
        setStatusText(status.status === "queued" ? "Queued…" : "Generating content…");

        if (status.status === "draft") {
          const content = await getGeneratedContent(id);
          setTitle(content.title);
          setPostBody(content.postBody);
          setHashtags(content.hashtags);
          setPhase("draft");
          return;
        }

        if (status.status === "failed") {
          setErrorMessage(status.error ?? "Generation failed");
          setPhase("error");
          return;
        }

        setTimeout(poll, 2000);
      };

      setTimeout(poll, 1000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to start generation");
      setPhase("error");
    }
  }, [prompt, tone, coverImageFile, coverImageUrl]);

  const handleSave = useCallback(async () => {
    if (!postId) return;
    setSaving(true);
    try {
      await updatePost(postId, {
        title: title.trim(),
        postBody: postBody.trim(),
        hashtags,
      });
      setSaveSuccess(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save");
      setPhase("error");
    } finally {
      setSaving(false);
    }
  }, [postId, title, postBody, hashtags]);

  const handleReset = useCallback(() => {
    setPhase("idle");
    setPrompt("");
    setCoverImageUrl("");
    setCoverImageFile(null);
    setPostId(null);
    setStatusText("");
    setErrorMessage("");
    setTitle("");
    setPostBody("");
    setHashtags([]);
  }, []);

  if (phase === "generating") {
    return (
      <section className="relative flex min-h-[320px] flex-col items-center justify-center gap-4 overflow-hidden rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-container/20 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <LoadingSpinner />
          <p className="font-label-md text-label-md text-primary">{statusText}</p>
        </div>
      </section>
    );
  }

  if (phase === "draft") {
    return (
      <section className="rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PreviewIcon className="h-5 w-5 text-primary" />
            <h2 className="font-headline-md text-headline-md text-on-background">
              Preview
            </h2>
          </div>
          <button
            className="font-label-sm text-label-sm text-on-surface-variant underline transition-colors hover:text-primary"
            onClick={handleReset}
            type="button"
          >
            New Post
          </button>
        </div>

        <div className="space-y-4">
          {coverImageUrl && (
            <div className="relative h-48 w-full overflow-hidden rounded-xl bg-surface-container">
              <Image
                alt="Cover"
                className="object-cover"
                fill
                src={coverImageUrl}
                unoptimized
              />
            </div>
          )}

          <input
            className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-headline-md text-headline-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Post title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="min-h-40 w-full resize-none rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Post body"
            value={postBody}
            onChange={(e) => setPostBody(e.target.value)}
          />

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary-container/20 px-3 py-1 font-label-sm text-label-sm text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              className="flex min-h-10 items-center gap-2 rounded-xl bg-primary px-6 py-2 font-label-md text-label-md font-bold text-on-primary transition-all hover:bg-primary-container disabled:opacity-50"
              disabled={saving}
              type="button"
              onClick={handleSave}
            >
              {saving ? "Saving…" : saveSuccess ? "Saved!" : "Save Changes"}
            </button>
            <button
              className="flex min-h-10 items-center gap-2 rounded-xl border-2 border-primary px-6 py-2 font-label-md text-label-md font-bold text-primary transition-all hover:bg-primary-container/10"
              type="button"
            >
              Post Immediately
            </button>
            <button
              className="flex min-h-10 items-center gap-2 rounded-xl border-2 border-outline-variant px-6 py-2 font-label-md text-label-md text-on-surface-variant transition-all hover:border-primary hover:text-primary"
              type="button"
            >
              Schedule Later
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (phase === "error") {
    return (
      <section className="rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
        <div className="rounded-xl border border-error-container bg-error-container px-4 py-3 font-label-md text-label-md text-on-error-container">
          {errorMessage}
        </div>
        <button
          className="mt-4 min-h-12 w-full rounded-xl bg-primary px-6 py-3 font-label-md text-label-md font-bold text-on-primary transition-all hover:bg-primary-container"
          type="button"
          onClick={handleReset}
        >
          Try Again
        </button>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-container/20 blur-3xl" />
      <div className="relative z-10">
        <div className="mb-6 flex items-center gap-2">
          <SparkleIcon className="h-6 w-6 text-secondary" />
          <h2 className="font-headline-md text-headline-md text-on-background">
            AI Generator
          </h2>
        </div>

        <textarea
          className="mb-4 h-32 w-full resize-none rounded-xl border border-outline-variant/30 bg-surface p-4 font-body-lg text-body-lg text-on-surface outline-none transition-all placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="What would you like to write about today?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="mb-6 flex flex-wrap gap-3">
          <input
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setCoverImageFile(file);
                setCoverImageUrl("");
              }
            }}
          />
          <button
            className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
            {coverImageFile ? coverImageFile.name : "Upload Cover Image"}
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <select
            className="rounded-lg border border-outline-variant/30 bg-surface px-4 py-2 font-label-md text-label-md text-on-surface-variant outline-none transition-colors focus:border-primary"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="Professional">Tone: Professional</option>
            <option value="Founder">Tone: Founder</option>
            <option value="Casual">Tone: Casual</option>
          </select>
          <select
            className="rounded-lg border border-outline-variant/30 bg-surface px-4 py-2 font-label-md text-label-md text-on-surface-variant outline-none transition-colors focus:border-primary"
            defaultValue="LinkedIn Post"
          >
            <option>Type: LinkedIn Post</option>
          </select>
          <select
            className="rounded-lg border border-outline-variant/30 bg-surface px-4 py-2 font-label-md text-label-md text-on-surface-variant outline-none transition-colors focus:border-primary"
            defaultValue="Standard (150 words)"
          >
            <option>Length: Standard (150 words)</option>
          </select>
        </div>

        <button
          className="bg-purple-gradient flex min-h-12 w-full items-center justify-center gap-2 rounded-xl py-4 font-label-md text-label-md font-bold text-white shadow-[0_12px_28px_rgba(113,42,226,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(113,42,226,0.3)] disabled:opacity-50 disabled:hover:translate-y-0"
          disabled={!prompt.trim()}
          type="button"
          onClick={handleGenerate}
        >
          <MagicIcon className="h-5 w-5" />
          Generate Content
        </button>
      </div>
    </section>
  );
}

function LoadingSpinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-10 w-10 animate-spin text-primary"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
        fill="currentColor"
      />
    </svg>
  );
}

type IconProps = { className?: string };

function IconBase({ children, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

function SparkleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9.81 15.9 9 18.75l-.81-2.85a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.85-.81a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.81 2.85a4.5 4.5 0 0 0 3.09 3.09l2.85.81-2.85.81a4.5 4.5 0 0 0-3.09 3.09Z" />
    </IconBase>
  );
}

function ImageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 5.25h15A1.5 1.5 0 0 1 21 6.75v10.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.25V6.75a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="m3 15 4.5-4.5 3 3 2.25-2.25L21 19" />
      <path d="M15.75 8.25h.01" />
    </IconBase>
  );
}

function MagicIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m14.25 5.25 4.5 4.5-9 9-4.5-4.5 9-9Z" />
      <path d="m12.75 6.75 4.5 4.5" />
      <path d="M5.25 3.75v3M3.75 5.25h3M19.5 16.5v3M18 18h3" />
    </IconBase>
  );
}

function PreviewIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </IconBase>
  );
}

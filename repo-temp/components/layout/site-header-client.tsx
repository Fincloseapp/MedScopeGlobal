"use client";



import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/layout/site-header";

import type { AppUser, Category } from "@/types/database";

import type { AccessLevelId } from "@/lib/config/access-levels";



type ReaderPayload = {

  user: { id: string; email?: string | null } | null;

  profile: AppUser | null;

  isVip: boolean;

  accessLevel: AccessLevelId;

};



const DEFAULT_READER: ReaderPayload = {

  user: null,

  profile: null,

  isVip: false,

  accessLevel: "public",

};



export function SiteHeaderClient({

  categories,

  locale,

  region,

}: {

  categories: Category[];

  locale: string;

  region: string;

}) {

  const [reader, setReader] = useState<ReaderPayload>(DEFAULT_READER);



  useEffect(() => {

    let cancelled = false;

    fetch("/api/v22/reader-context", { credentials: "same-origin" })

      .then((r) => (r.ok ? r.json() : DEFAULT_READER))

      .then((data: ReaderPayload) => {

        if (!cancelled) setReader(data);

      })

      .catch(() => {});

    return () => {

      cancelled = true;

    };

  }, []);



  return (

    <SiteHeader

      categories={categories}

      locale={locale}

      region={region}

      user={reader.user}

      profile={reader.profile}

      isVip={reader.isVip}

      accessLevel={reader.accessLevel}

    />

  );

}



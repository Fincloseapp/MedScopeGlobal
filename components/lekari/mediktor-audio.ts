/** @deprecated Import from `@/components/lekari/ordizapis-audio` */
export {
  ORDIZAPIS_FILE_ACCEPT,
  ORDIZAPIS_MAX_FILE_BYTES,
  ORDIZAPIS_UPLOAD_CHUNK_BYTES,
  ORDIZAPIS_FILE_ACCEPT as MEDIKTOR_FILE_ACCEPT,
  ORDIZAPIS_MAX_FILE_BYTES as MEDIKTOR_MAX_FILE_BYTES,
  ORDIZAPIS_UPLOAD_CHUNK_BYTES as MEDIKTOR_UPLOAD_CHUNK_BYTES,
  resolveAudioMeta,
  normalizePhoneFile,
  isFetchNetworkError,
  friendlyFetchError,
  uploadAndTranscribePhoneFile,
  uploadAndProcessPhoneFile,
  prepareUploadBlobs,
} from "@/components/lekari/ordizapis-audio";
export type { PhoneTranscribeResult } from "@/components/lekari/ordizapis-audio";

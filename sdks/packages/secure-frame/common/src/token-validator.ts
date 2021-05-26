
export const LunaSecTokenRegex = /^lunasec_[0-9a-zA-Z]{8}\b_[0-9a-zA-Z]{4}\b_[0-9a-zA-Z]{4}\b_[0-9a-zA-Z]{4}\b_[0-9a-zA-Z]{12}$/

export function isLunaSecToken(maybeToken?: string) {
  if (maybeToken === undefined) {
    return false;
  }

  return LunaSecTokenRegex.test(maybeToken);
}

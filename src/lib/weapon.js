const directoryBackLink = document.querySelector(
  "[data-weapon-directory-back-link]",
);
const rememberedDirectoryState = window.sessionStorage.getItem(
  "weapons-directory-state",
);

if (
  directoryBackLink instanceof HTMLAnchorElement &&
  typeof rememberedDirectoryState === "string"
) {
  directoryBackLink.href =
    rememberedDirectoryState.length > 0
      ? `/weapons?${rememberedDirectoryState}`
      : "/weapons";
}

export {};

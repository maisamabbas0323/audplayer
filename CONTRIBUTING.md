# Contributing to Audplayer

Thanks for contributing! This guide covers how to work on the codebase.

**Repository:** [github.com/maisamabbas0323/audplayer](https://github.com/maisamabbas0323/audplayer)

## Getting started

Clone the repo before making changes:

```bash
git clone https://github.com/maisamabbas0323/audplayer.git
cd audplayer
npm install
npx expo start            # dev server (device/emulator via Expo Go)
npx expo start --offline  # if your network can't reach Expo's version API
npx expo start --web      # browser build
```

> Tip: when Node's outbound HTTPS is flaky on your network, use
> `export NODE_OPTIONS="--dns-result-order=ipv4first"` before running any
> `expo`/`eas` command that talks to Expo servers.

## Codebase conventions

- **TypeScript, strict mode.** Keep the whole tree type-safe; no `any` unless there's no other option (and then scope it tightly with a comment).
- **Follow existing patterns before inventing new ones.** Look at a neighboring file first:
  - Colors, spacing, type and radius come from `src/theme.ts` — never hardcode values.
  - Icons come from `src/components/Icon.tsx`; add an icon there rather than a new SVG.
  - Shared UI lives in `src/components`; player logic lives in `src/hooks/useAudioPlayer.ts`; platform/filework lives in `src/lib`.
  - Global app state flows through `src/context/AppProvider.tsx` — screens pull from `useApp()`, they don't own app data.
- **No stray comments.** Code should read clearly on its own; only add comments where non-obvious platform behavior needs explaining.
- **Keep new dependencies out unless justified.** The app is deliberately small; an import that isn't necessary won't land.

## Verification

Run the typecheck before finishing any change:

```bash
npx tsc --noEmit
```

There is no automated test suite yet — verify by hand:

1. Run the app in Expo Go/emulator **and** on web; web is where a lot of platform bugs hide.
2. Exercise the change across the flow that touches it (e.g. imports → library → playback).
3. `npx expo export --platform web` will catch bundling errors for the web target.

## Git workflow

- Fork [maisamabbas0323/audplayer](https://github.com/maisamabbas0323/audplayer) (or clone directly if you're a maintainer).
- Branch per change: `fix/<what>`, `feat/<what>`, `chore/<what>`.
- Keep commits small and focused, with a message describing the *why*.
- Open a pull request against `master` in the [upstream repo](https://github.com/maisamabbas0323/audplayer).

This project is licensed under the [MIT License](LICENSE). By contributing, you agree that your contributions are licensed under the same terms.

## Building the APK

Local: `npx eas-cli build --platform android --profile preview` (produces `build/audplayer.apk`).

The `eas.json` profiles map to:

| Profile      | Purpose                                  | Output        |
| ------------ | ---------------------------------------- | ------------- |
| development  | Dev client (local debugging)             | APK           |
| preview      | Internal test installs                   | **APK**       |
| production   | Store release                            | AAB           |

## Troubleshooting

- **`TypeError: fetch failed` on `expo start`** — the CLI can't reach Expo's API over the network; use `npx expo start --offline`.
- **`eas build` dies with a GraphQL/network error after upload** — retry; if it recurs, set the IPv4 env var above and retry.
- **APK never gets the scan/library permission prompt** — the native manifest is generated at prebuild/build time; rebuild the APK after changing permissions or plugins (`npx expo prebuild` for a local build).
# Jumpcloud Attack Logs to Discord

This is exactly what the title says lol, it takes jumpcloud exported logs, sifts through them and sends failed attack logs to Discord via webhook. Chinese heckers need to know they aren't safe.

## Getting Started

- Download json of jumpcloud logs daily, weekly, whatever, place in `./dump`

- Install deps, `yarn` or `npm i`

- Install typescript globally, `yarn -g typescript ts-node` or `npm i typescript ts-node -g`

- Start and let the thing run, it loops every 24 hours and caches what has already been posted.

  - `yarn dev` or `npm dev`

- If you're a weirdo and want to compile to javascript:
  - `yarn build` --> `yarn start` || `npm build` --> `npm start`

## Extras

- Dumps daily IPs into hastebin
- Posts to discord webhook, with raw dump json file
- Stores hastebin dumps in `./dump/hastebin_urls.txt`
- Auto cleans storage
- Has an API that shows both current ones and prior stored URLs
- Reports attackers to ARIN whois abuse contacts
- More??? Maybe

## Discord Embed

![img](https://i.imgur.com/KKfna15.png)

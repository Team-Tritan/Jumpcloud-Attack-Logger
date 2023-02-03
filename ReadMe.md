# Jumpcloud Attack Logs to Discord

This is exactly what the title says lol, it takes jumpcloud exported logs, sifts through them and sends failed attack logs to Discord via webhook. Chinese heckers need to know they aren't safe.

## Getting Started

- Download json of jumpcloud logs daily, weekly, whatever, place in `./dump`

- Install deps, `yarn` or `npm i`

- Install typescript globally, `yarn -g typescript ts-node` or `npm i typescript ts-node -g`

- Start and let the thing run, it loops every 24 hours and caches what has already been posted.

  - `yarn start` or `npm start`

## Discord Embed

![img](https://i.imgur.com/AqJzbDQ.png)

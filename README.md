# Timezone Pain for Google Calendar

Timezone Pain is a Chrome extension that colours the time zone columns in Google Calendar’s Week and Day views. See at a glance whether a meeting falls during working hours, outside working hours, or overnight in each displayed time zone.

## Install in Chrome

1. Download **Source code (zip)** from the [v0.3.0 release](https://github.com/jamesfconway/penumbra/releases/tag/v0.3.0) and extract it to a folder you’ll keep.
2. Open `chrome://extensions` in Chrome and turn on **Developer mode**.
3. Click **Load unpacked** and select the extracted folder containing `manifest.json`.
4. Open or refresh Google Calendar and switch to **Week** or **Day** view.

If you already have the extension installed, follow the [update instructions](INSTALL.txt) to keep your existing settings.

## Customise your hours and colours

Open the extension’s toolbar menu and select **Settings**. Set your working and night hours to the minute, including ranges that cross midnight. You can also adjust the light and dark palettes independently.

| Default colour | Local time |
| --- | --- |
| Green | 09:00–17:00 |
| Yellow | 06:00–09:00 and 17:00–21:00 |
| Red | 21:00–06:00 the next day |

Your schedule applies every day in each displayed time zone. The extension supports English 12-hour labels and numeric 24-hour labels.

## Privacy

The extension runs on `calendar.google.com`, where it reads displayed hour labels and applies styling. Chrome’s local extension storage holds your palettes and time ranges. Calendar events stay untouched, and the extension sends no data.


# Memes War Bot

Please support the author by using the referral link to get started: [https://t.me/Memes_War_Start_Bot/MemesWar?startapp=XYJMJD](https://t.me/Memes_War_Start_Bot/MemesWar?startapp=XYJMJD)

---

## Overview

Memes War Bot is a tool to automate tasks and manage rewards in the Memes War game. It helps in handling referrals, checking quests, claiming rewards, donating warbond tokens to a guild, and checking in. This bot operates with a list of Telegram query IDs and custom user-agent strings to manage multiple accounts.

## Features

- **Referral Management**: Sets referral codes for new accounts.
- **Quest Processing**: Verifies, claims, and completes quests.
- **Reward Management**: Claims and checks rewards from treasury and quests.
- **Warbond Donation**: Automates donation of warbond tokens to the specified guild.
- **Account Check-In**: Automates daily check-ins for each account.
- **Multiple Account Handling**: Supports managing multiple accounts through query IDs stored in a file.
  
## Installation

To get started with this bot, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Animehub4u/Memes-war-bot.git
   cd Memes-war-bot
   ```

2. **Install dependencies**:

   Ensure you have Node.js installed, then run:

   ```bash
   npm install
   ```

3. **Setup Files**:

   - Create a `hash.txt` file in the project directory, containing Telegram query IDs (one per line).

4. **Run the Bot**:

   ```bash
   node index.js
   ```

## Configuration

- **Referral Code**: The bot uses a referral code specified in the `referralCode` variable in the script. You can change it if needed.
- **Guild ID**: The bot uses a guild ID specified in the `guildId` variable in the script for donations. Update this ID as per your guild requirements.
- **User-Agent List**: Modify `user-agent-phone.txt` to include user-agent strings compatible with your accounts.
- **Query IDs**: Store Telegram query IDs in `hash.txt`, each on a new line.

## Files Needed

1. **`user-agent-phone.txt`**: Contains a list of User-Agent strings, one per line. The bot will randomly select these for requests.
2. **`hash.txt`**: Contains the list of Telegram query IDs, one per line. Each account uses a unique query ID for account management and task automation.

## Main Functions

- **Referral Setup**: Adds a referral code to new accounts.
- **Quest Management**: Automates quest verification, claiming, and reward collection.
- **Reward Claiming**: Collects rewards from quests and treasury.
- **Guild Donation**: Donates warbond tokens to a specified guild.
- **Daily Check-In**: Handles daily check-ins to accumulate rewards.

## Author

Bot created by: [https://t.me/airdropscriptzone](https://t.me/airdropscriptzone)

---

### Support

Feel free to reach out on [author's Telegram channel](https://t.me/airdropscriptzone) for support or if you find this bot helpful!

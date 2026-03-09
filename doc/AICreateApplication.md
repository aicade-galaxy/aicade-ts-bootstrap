# AI Integration and Application Development Guide (Based on aicade TS SDK)

This document guides developers in using the **aicade TypeScript SDK** to generate code with AI and complete the integration, development, packaging, and upload process for game apps. It is suitable for developers integrating with the aicade ecosystem for the first time.

---

## 1. Prepare the Basic Development Environment

Before getting started, make sure your local machine has the following environment ready:

- **Runtime**: Node.js (LTS recommended)
- **Package manager**: npm
- **IDE**: VS Code, Cursor, or other AI-assisted IDEs
- **aicade platform app info**: Your aicade platform app information, including app ID and developer keys (`appKey`, `secretKey`)

---

## 2. Get the Sample Project and SDK Documentation

### 2.1 Download the aicade TS Demo Project

An out-of-the-box Demo project is officially provided. It includes a basic app structure and the TS SDK library, which helps you get started quickly.

Project repo: `aicade-ts-botstrap`

```bash
git clone git@github.com:aicadegalaxy/aicade-ts-bootstrap.git
```

> This scaffold already includes the basic runtime environment and aicade TS SDK dependency configuration.

---

### 2.2 Install Project Dependencies

Enter the scaffold project directory and install dependencies:

```bash
cd aicade-ts-botstrap
npm install
```

---

## 3. Organize Business Requirements and Generate an AI Prompt

Before formal development, you should **structure your business requirements into a clear prompt** so that the AI can accurately understand and generate code that meets expectations.

### 3.1 Build the Final Prompt with aicade Platform Capabilities

On top of the base prompt, add **aicade platform integration requirements**, for example:

- Point exchange rules
- SDK invocation method
- Local storage replacement strategy
- Wallet address display

---

### 3.2 Example: Final Integration Prompt (Recommended)

**Key additional constraints:**

- Game points can be exchanged to `Aicade Point` at a **100 : 1** ratio
- **Each user can exchange up to 100 Aicade Point per day**
- Point exchange is triggered **when the game ends (win or fail)**
- Use capabilities provided by `aicade-ts-sdk` to replace native browser capabilities where applicable

**The prompt must clearly include the following integration requirements:**

- `aicade-ts-sdk` has already been integrated in `package.json` and can be used directly
- Read before development: `doc/README.md`
- Use SDK `LocalStorageTools` instead of `localStorage`
- Display the current user's wallet address at the top of the page

---

```
Role setup: You are a senior game development engineer proficient in nodejs, npm, vite, typescript, and web3. You specialize in writing web mini-game code with clear structure, detailed comments, and performance optimizations.

Project goal: Please help me develop a pixel-style vertical shooter game named "Space Guardian Battle".

Core visuals and audio:

Art style: Full Pixel Art. The background is deep space (with a scrolling starfield effect). The player's fighter, enemies, and Boss all use pixel-style designs.

Audio: Include background music (BGM), shooting sound effects, explosion sound effects, and a Boss entrance alert.

Game mechanics:

Controls: The player clicks the left mouse button to shoot (or holds to fire continuously), and the fighter follows the mouse position.

Life system: The player starts with 3 lives. Being hit by an enemy bullet deducts 1 life. The game is over when all 3 lives are lost.

Failure condition: In addition to running out of lives, if any enemy crosses the bottom of the screen (reaches Earth), the game ends immediately.

Difficulty curve: As game time increases, enemy spawn frequency and movement speed gradually increase.

Level design: The game has 10 levels. Each level has a total of 50 enemies including the Boss. The level ends with a Boss battle.


Normal enemies:

Randomly generate multiple alien variants.

HP range is 1-5. Higher-HP enemies should look larger or more complex.

Attack: Some advanced aliens can shoot spread bullets or multiple bullets downward.

Scoring system: Defeating enemies grants points, calculated as: 1 HP = 1 point.

Boss battle:

Spawn one Boss at the end of each level.

Boss HP is 100, with a unique pixel appearance (each level's Boss should look different).

The Boss has complex bullet patterns (such as circular bullets and homing bullets).

TS SDK integration requirements:
1. The `aicade-ts-sdk` lib has already been integrated in `package.json` and can be used directly.
2. Before development starts, first read the aicade-ts-sdk development documentation in [aicade-ts-sdk-document](./doc/README.md) and understand the supported modules.
3. Each time the game ends (including level clear or death), points can be exchanged into Aicade Point at a 100:1 ratio by calling `aicade-ts-sdk`.
4. Limit each user to exchanging at most 100 Aicade Point per day.
5. If local storage is needed (for example, if `localStorage` would normally be used), replace it with `aicade-ts-sdk`'s `LocalStorageTools`.
6. Add wallet address display and account Aicade Point balance display at the top (label it as "积分").

Technical requirements:

1. Extend and generate based on the current project environment.

2. Use clear logic and classes to manage objects such as Player, Enemy, Bullet, Particle, etc.

3. Include a simple start screen, an in-game screen, and a score settlement screen with a "Restart" button.

4. Please provide a complete single-file implementation containing all logic. (Use Canvas drawing API or Base64 placeholders for pixel assets.)
```

## 4. Use AI in the IDE to Generate Code

### 4.1 Open the Project Directory

Make sure the root directory opened in your IDE is:

```text
aicade-ts-botstrap
```

### 4.2 Update Your App Information

The created app will eventually be uploaded to the aicade platform, which requires your app key and related credentials.

```env
VITE_AICADE_API_KEY=d4********6878d1
VITE_AICADE_API_SECRET_KEY=bQYX/2**********3+C57w= 
VITE_AICADE_API_APP_NO=D4E42XXD
```

### 4.3 Paste the Final Prompt and Generate Code

Paste the **final prompt prepared in Step 3** into the AI chat box and wait for code generation to complete.

> ⚠️ It is recommended to do a quick manual review after generation:
> - Whether SDK calls are correct
> - Whether the point exchange logic complies with platform limits
> - Whether any native browser capabilities were left unreplaced

---

## 5. Package and Upload to the aicade Platform

After feature development and testing are complete, run the following command to package and upload:

```bash
npm run upload
```

After a successful upload, you can test and publish the app on the aicade platform.
[Below is the success message after upload]

```
Upload success! {"code":200,"message":"success","data":"ok"}
```

** After a successful upload, you can check it on the aicade platform **

```
[Application Management](https://aicadegalaxy.com/admin/management)
```

For further expansion, such as leaderboards, achievements, on-chain interactions, and more, you can continue secondary development based on the aicade TS SDK.

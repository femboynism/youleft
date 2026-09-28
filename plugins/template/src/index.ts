import { findByStoreName, findByName, findByProps, findAll } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { storage } from "@vendetta/plugin";

const LARP_UI_TAG = "v11.1.5";

const { View, Text, TextInput, ScrollView } = RN;
const Pressable: any = (RN as any).Pressable || (RN as any).TouchableOpacity;

/* ------------------------------------------------------------------ */
/* Storage-Defaults                                                    */
/* ------------------------------------------------------------------ */

const store: any = storage;
if (store.matchUsername == null) store.matchUsername = "";
if (store.replaceUsername == null) store.replaceUsername = "";
if (store.spoofAccountDateIso == null) store.spoofAccountDateIso = "";
if (typeof store.badges !== "object" || store.badges === null) store.badges = {};
if (typeof store.hideNative !== "object" || store.hideNative === null) store.hideNative = {};
if (store.hideNative.quest == null) store.hideNative.quest = false;
if (store.hideNative.orb == null) store.hideNative.orb = false;
if (store.hideNative.nitro == null) store.hideNative.nitro = false;
if (store.hideNative.boost == null) store.hideNative.boost = false;
if (store.hideNative.orbBalance == null) store.hideNative.orbBalance = false;
if (store.hideNative.legacyUsername == null) store.hideNative.legacyUsername = false;
if (store.hideNative.levelLeaf == null) store.hideNative.levelLeaf = false;
if (store.hideNative.idSubstrings == null) store.hideNative.idSubstrings = "";
if (!Array.isArray(store.otherProfiles)) store.otherProfiles = [];

/* ------------------------------------------------------------------ */
/* Badge-Definitionen                                                  */
/* ------------------------------------------------------------------ */

interface BadgeDef {
    id: string;
    label: string;
    asset?: string;
    assetCandidates?: string[];
    url: string;
}

const CDN = "https://cdn.discordapp.com/badge-icons";
const ICON_EMERALD = "11e2d339068b55d3a506cff34d3780f3";
const ICON_RUBY = "cd5e2cfd9d7f27a8cdcd3e8a8d5dc9f4";
const ICON_OPAL = "5b154df19c53dce2af92c9b61e6be5e2";

const BADGES: BadgeDef[] = [
    { id: "staff", label: "Discord Staff", asset: "StaffBadge", url: CDN + "/5e74e9b61934fc1f67c65515d1f7e60d.png" },
    { id: "partner", label: "Discord Partner", asset: "DiscordPartnerBadge", url: CDN + "/3f9748e53446a137a052f3454e2de41e.png" },
    { id: "moderator", label: "Certified Moderator", asset: "DiscordCertifiedModeratorBadge", url: CDN + "/fee1624003e2fee35cb398e125dc479b.png" },
    { id: "hypesquad_events", label: "HypeSquad Events", asset: "HypeSquadEventsBadge", url: CDN + "/bf01d1073931f921909045f3a39fd264.png" },
    { id: "hypesquad_bravery", label: "HypeSquad Bravery", asset: "HypeSquadBraveryBadge", url: CDN + "/8a88d63823d8a71cd5e390baa45efa02.png" },
    { id: "hypesquad_brilliance", label: "HypeSquad Brilliance", asset: "HypeSquadBrillianceBadge", url: CDN + "/011940fd013da3f7fb926e4a1cd2e618.png" },
    { id: "hypesquad_balance", label: "HypeSquad Balance", asset: "HypeSquadBalanceBadge", url: CDN + "/3aa41de486fa12454c3761e8e223442e.png" },
    { id: "bug_hunter_1", label: "Bug Hunter Level 1", asset: "BugHunterLevel1Badge", url: CDN + "/2717692c7dca7289b35297368a940dd0.png" },
    { id: "bug_hunter_2", label: "Bug Hunter Level 2", asset: "BugHunterLevel2Badge", url: CDN + "/848f79194d4be5ff5f81505cbd0ce1e6.png" },
    { id: "active_developer", label: "Active Developer", asset: "ActiveDeveloperBadge", url: CDN + "/6bdc42827a38498929a4920da12695d9.png" },
    { id: "verified_developer", label: "Early Verified Bot Dev", asset: "VerifiedDeveloperBadge", url: CDN + "/6df5892e0f35b051f8b61eace34f4967.png" },
    { id: "early_supporter", label: "Early Supporter", asset: "EarlySupporterBadge", url: CDN + "/7060786766c9c840eb3019e725d2b358.png" },
    {
        id: "premium",
        label: "Discord Nitro (generic icon)",
        assetCandidates: ["NitroSubscriberBadge", "NitroSubscriber", "PremiumSubscriberBadge", "SubscriberBadge"],
        url: CDN + "/2ba85e8026a8614b640c2837bcdfe21b.png",
    },
    { id: "premium_tenure_3_month", label: "Nitro · ~3 mo (bronze)", assetCandidates: ["NitroBronzeBadge", "NitroBronze", "premium_tenure_03_month_v2"], url: CDN + "/6de6d34650760ba5551a79732e98ed60.png" },
    { id: "premium_tenure_6_month", label: "Nitro · ~6 mo (silver)", assetCandidates: ["NitroSilverBadge", "NitroSilver", "premium_tenure_06_month_v2"], url: CDN + "/6de6d34650760ba5551a79732e98ed60.png" },
    { id: "premium_tenure_12_month", label: "Nitro · ~12 mo (gold)", assetCandidates: ["NitroGoldBadge", "NitroGold", "premium_tenure_12_month_v2"], url: CDN + "/d92998916f4ce6f74de7da0a37b8d740.png" },
    { id: "premium_tenure_24_month", label: "Nitro · ~24 mo (platinum)", assetCandidates: ["NitroPlatinumBadge", "NitroPlatinum", "premium_tenure_24_month_v2"], url: CDN + "/9d4f73ca6df09bc63a39ea84d5fd0ff5.png" },
    { id: "premium_tenure_36_month", label: "Nitro · ~36 mo (diamond)", assetCandidates: ["NitroDiamondBadge", "NitroDiamond", "premium_tenure_36_month_v2"], url: CDN + "/65d6d6df9d56b8c3f4b3b1f3e4f3a0c8.png" },
    {
        id: "premium_tenure_emerald",
        label: "Nitro · Emerald (36 mo.)",
        assetCandidates: ["NitroEmeraldBadge", "NitroEmerald", "EmeraldNitroBadge", "premium_tenure_36_month_v2"],
        url: CDN + "/" + ICON_EMERALD + ".png",
    },
    {
        id: "premium_tenure_ruby",
        label: "Nitro · Ruby (60 mo.)",
        assetCandidates: ["NitroRubyBadge", "NitroRuby", "RubyNitroBadge", "premium_tenure_60_month_v2"],
        url: CDN + "/" + ICON_RUBY + ".png",
    },
    {
        id: "premium_tenure_opal",
        label: "Nitro · Opal (72+ mo)",
        assetCandidates: ["NitroOpalBadge", "NitroOpal", "NitroFireBadge", "FireNitroBadge", "premium_tenure_72_month_v2"],
        url: CDN + "/" + ICON_OPAL + ".png",
    },
    {
        id: "guild_boost_12",
        label: "Server boost · ~12 mo",
        assetCandidates: ["GuildBoosterLevel6Badge", "GuildBoosterBadgeTier6", "PremiumGuildSubscriberBadgeTier6", "guild_booster_lvl6"],
        url: CDN + "/991c9f39ee33d7537d9f408c3e53141e.png",
    },
    {
        id: "guild_boost_24",
        label: "Server boost · ~24 mo",
        assetCandidates: ["GuildBoosterLevel9Badge", "GuildBoosterBadgeTier9", "PremiumGuildSubscriberBadgeTier9", "guild_booster_lvl9"],
        url: CDN + "/ec92202290b48d0879b7413d2dde3bab.png",
    },
    { id: "bot_commands", label: "Supports Commands", asset: "BotCommandsBadge", url: CDN + "/6f9e37f9029ff57aef81db857890005e.png" },
    { id: "automod", label: "Uses AutoMod", asset: "AutoModBadge", url: CDN + "/f2459b691ac7453ed6039bbcfaccbfcd.png" },
    { id: "legacy_username", label: "Originally Known As", asset: "LegacyUsernameBadge", url: CDN + "/6de6d34650760ba5551a79732e98ed60.png" },
    { id: "quest", label: "Completed a Quest", asset: "QuestBadge", url: CDN + "/7d9ae358c8c5e118768335dbe68b4fb8.png" },
];

const QUEST_BADGE_ICON_HASH = "7d9ae358c8c5e118768335dbe68b4fb8";
const ORB_BADGE_ICON_HASH = "83d8a1eb09a8d64e59233eec5d4d5c2d";
const LEVEL_LEAF_ICON_HASH = "ca105ad9cfc8580c765101d17bbb2323";

const NITRO_LARP_ORDER = [
    "premium_tenure_opal",
    "premium_tenure_ruby",
    "premium_tenure_emerald",
    "premium_tenure_36_month",
    "premium_tenure_24_month",
    "premium_tenure_12_month",
    "premium_tenure_6_month",
    "premium_tenure_3_month",
    "premium",
];
const NITRO_LARP_SET: Record<string, boolean> = {};
for (const id of NITRO_LARP_ORDER) NITRO_LARP_SET[id] = true;

const BOOST_LARP_ORDER = ["guild_boost_24", "guild_boost_12"];
const BOOST_LARP_SET: Record<string, boolean> = {};
for (const id of BOOST_LARP_ORDER) BOOST_LARP_SET[id] = true;

const NITRO_NATIVE_ASSET_NAMES = [
    "NitroSubscriberBadge", "NitroSubscriber", "PremiumSubscriberBadge", "SubscriberBadge",
    "NitroBronzeBadge", "NitroBronze", "NitroSilverBadge", "NitroSilver",
    "NitroGoldBadge", "NitroGold", "NitroPlatinumBadge", "NitroPlatinum",
    "NitroDiamondBadge", "NitroDiamond", "NitroEmeraldBadge", "NitroEmerald", "EmeraldNitroBadge",
    "NitroRubyBadge", "NitroRuby", "RubyNitroBadge",
    "NitroOpalBadge", "NitroOpal", "NitroFireBadge", "FireNitroBadge",
    "PremiumTenureBadge", "ProfilePremiumBadge", "ProfileNitroBadge", "TenureBadge",
];

const LARP_BADGE_META: Record<string, { uri: string; label: string }> = {};
for (const b of BADGES) {
    LARP_BADGE_META["larp-" + b.id] = { uri: b.url, label: b.label };
}

/* ------------------------------------------------------------------ */
/* Asset-Helfer                                                        */
/* ------------------------------------------------------------------ */

function collectAssetNames(b: BadgeDef): string[] {
    const out: string[] = [];
    if (b.assetCandidates) for (const c of b.assetCandidates) out.push(c);
    if (b.asset) out.push(b.asset);
    return out;
}

function toNum(id: any): number {
    return typeof id === "number" ? id : typeof id === "string" ? parseInt(id, 10) : NaN;
}

function firstResolvedAsset(names: string[]): number | null {
    if (!names || !names.length) return null;
    for (const name of names) {
        try {
            const n = toNum(getAssetIDByName(name));
            if (!isNaN(n) && isFinite(n)) return n;
        } catch {}
    }
    return null;
}

function makeBadgePayload(b: BadgeDef): any {
    const idOut = "larp-" + b.id;
    if (NITRO_LARP_SET[b.id] || BOOST_LARP_SET[b.id]) {
        return { id: idOut, description: b.label, icon: " " };
    }
    const assetNum = firstResolvedAsset(collectAssetNames(b));
    if (assetNum != null) {
        return { id: idOut, icon: assetNum, source: assetNum, description: b.label };
    }
    return { id: idOut, description: b.label, icon: " " };
}

function getEnabledNitroLarpIdFromMap(bm: any): string | null {
    if (!bm || typeof bm !== "object") return null;
    for (const tid of NITRO_LARP_ORDER) if (bm[tid]) return tid;
    return null;
}

function getEnabledBoostLarpIdFromMap(bm: any): string | null {
    if (!bm || typeof bm !== "object") return null;
    for (const bid of BOOST_LARP_ORDER) if (bm[bid]) return bid;
    return null;
}

function badgeHaystack(b: any): string {
    if (!b) return "";
    const bits = [
        String(b.id || ""),
        String(b.description || ""),
        String(b.tooltip || ""),
        String(b.icon != null ? b.icon : ""),
    ];
    try { if (b.link != null) bits.push(JSON.stringify(b.link)); } catch {}
    try { if (b.source != null) bits.push(JSON.stringify(b.source)); } catch {}
    return bits.join("\n").toLowerCase();
}

const LARP_ICON_IDS_QUEST: Record<string, boolean> = {};
const LARP_ICON_IDS_ORB: Record<string, boolean> = {};
const LARP_ICON_IDS_NITRO: Record<string, boolean> = {};

function addAssetNamesToIconSet(nameList: string[], setObj: Record<string, boolean>) {
    if (!nameList || !nameList.length) return;
    for (const name of nameList) {
        try {
            const n = toNum(getAssetIDByName(name));
            if (!isNaN(n) && isFinite(n)) setObj[String(n)] = true;
        } catch {}
    }
}

function warmLarpIconAssetCache() {
    try {
        addAssetNamesToIconSet(["QuestBadge", "QuestCompletedBadge", "QuestCompletedProfileBadge", "ProfileQuestBadge"], LARP_ICON_IDS_QUEST);
        addAssetNamesToIconSet(["OrbProfileBadge", "CollectedOrbProfileBadge", "ProfileOrbBadge", "OrbBadge"], LARP_ICON_IDS_ORB);
        addAssetNamesToIconSet(NITRO_NATIVE_ASSET_NAMES, LARP_ICON_IDS_NITRO);
    } catch {}
}

function iconIdInSet(b: any, setObj: Record<string, boolean>): boolean {
    if (!b || b.icon == null || !setObj) return false;
    return !!setObj[String(b.icon)];
}

function isGuildBoostBadge(b: any): boolean {
    if (!b) return false;
    const id = String(b.id || "").toLowerCase();
    const desc = String(b.description || "").toLowerCase();
    if (id.indexOf("guild_booster") !== -1) return true;
    if (id.indexOf("premium_guild") !== -1) return true;
    if (desc.indexOf("server boost") !== -1) return true;
    if (desc.indexOf("guild boost") !== -1) return true;
    if (desc.indexOf("boosting") !== -1 && desc.indexOf("nitro") === -1) return true;
    return false;
}

function isNativeNitroLike(b: any): boolean {
    if (!b) return false;
    if (String(b.id || "").indexOf("larp-") === 0) return false;
    if (isGuildBoostBadge(b)) return false;
    const id = String(b.id || "").toLowerCase();
    const desc = String(b.description || "").toLowerCase();
    if (id.indexOf("premium_tenure") !== -1 && id.indexOf("guild") === -1) return true;
    if (id.indexOf("premium_since") !== -1 && id.indexOf("guild") === -1) return true;
    if (id.indexOf("nitro") !== -1 && id.indexOf("guild") === -1) return true;
    if (id.indexOf("premium") !== -1 && id.indexOf("guild") === -1) return true;
    if (id.indexOf("subscriber") !== -1 && desc.indexOf("nitro") !== -1) return true;
    if (desc.indexOf("discord nitro") !== -1) return true;
    if (
        desc.indexOf("nitro") !== -1 &&
        /subscriber|since|month|year|tenure|bronze|silver|gold|platinum|diamond|emerald|ruby|opal|classic|basic/i.test(desc)
    ) {
        return true;
    }
    if (iconIdInSet(b, LARP_ICON_IDS_NITRO)) return true;
    return false;
}

function nativeBoostCount(arr: any[]): number {
    let c = 0;
    for (const x of arr) if (isGuildBoostBadge(x)) c++;
    return c;
}

function nativeNitroCount(arr: any[]): number {
    let c = 0;
    for (const x of arr) if (isNativeNitroLike(x)) c++;
    return c;
}

function shouldHideNativeBadge(b: any): boolean {
    if (!b) return false;
    if (String(b.id || "").indexOf("larp-") === 0) return false;
    const h = store.hideNative || {};
    const id = String(b.id || "").toLowerCase();
    const desc = String(b.description || b.tooltip || "").toLowerCase();
    let hay = "";
    if (h.quest || h.orb || h.levelLeaf || (h.idSubstrings && String(h.idSubstrings).trim())) {
        hay = badgeHaystack(b);
    }

    if (h.quest) {
        if (id.indexOf("quest") !== -1 || desc.indexOf("quest") !== -1) return true;
        if (hay && hay.indexOf(QUEST_BADGE_ICON_HASH) !== -1) return true;
        if (iconIdInSet(b, LARP_ICON_IDS_QUEST)) return true;
    }
    if (h.orb) {
        if (id.indexOf("orb") !== -1 || desc.indexOf("orb profile") !== -1 || desc.indexOf("collected the orb") !== -1) {
            return true;
        }
        if (hay && hay.indexOf(ORB_BADGE_ICON_HASH) !== -1) return true;
        if (iconIdInSet(b, LARP_ICON_IDS_ORB)) return true;
    }
    if (h.nitro && isNativeNitroLike(b)) return true;
    if (h.boost && isGuildBoostBadge(b)) return true;
    if (h.levelLeaf) {
        if (hay && hay.indexOf(LEVEL_LEAF_ICON_HASH) !== -1) return true;
        if (id.indexOf("april_fool") !== -1 || id.indexOf("aprilfool") !== -1) return true;
        if (/\blevel\b\s*\d+\s*reached/i.test(desc) || /\breached\b.*\blevel\b/i.test(desc)) return true;
        if (/niveau.*atteint|atteint.*niveau/i.test(desc)) return true;
    }
    if (
        h.legacyUsername &&
        (id.indexOf("legacy_username") !== -1 ||
            id.indexOf("originally_known") !== -1 ||
            desc.indexOf("originally known") !== -1)
    ) {
        return true;
    }
    const raw = String(h.idSubstrings || "").trim().toLowerCase();
    if (raw) {
        const parts = raw.split(/[\s,;]+/);
        for (const frag of parts) {
            if (frag && id.indexOf(frag) !== -1) return true;
        }
    }
    return false;
}

function isNitroBadgeRow(b: any, nitroPayload: any): boolean {
    if (!b) return false;
    if (nitroPayload != null && String(b.id) === String(nitroPayload.id)) return true;
    if (nitroPayload == null && isNativeNitroLike(b)) return true;
    return false;
}

function isBoostBadgeRow(b: any, boostPayload: any): boolean {
    if (!b) return false;
    if (boostPayload != null && String(b.id) === String(boostPayload.id)) return true;
    if (boostPayload == null && isGuildBoostBadge(b)) return true;
    return false;
}

function plateRank(b: any, nitroPayload: any, boostPayload: any): number {
    if (!b) return 999;
    if (isNitroBadgeRow(b, nitroPayload)) return 0;

    const id = String(b.id || "").toLowerCase();
    const desc = String(b.description || "").toLowerCase();

    if (id === "staff" || id.indexOf("larp-staff") === 0 || desc.indexOf("discord staff") !== -1) return 10;
    if (id.indexOf("larp-partner") === 0 || (id.indexOf("partner") !== -1 && id.indexOf("application_guild") === -1)) return 20;
    if (
        id.indexOf("larp-hypesquad_events") === 0 ||
        id === "hypesquad" ||
        id.indexOf("hypesquad_events") !== -1 ||
        (desc.indexOf("hypesquad") !== -1 &&
            desc.indexOf("house") === -1 &&
            desc.indexOf("bravery") === -1 &&
            desc.indexOf("brilliance") === -1 &&
            desc.indexOf("balance") === -1)
    ) {
        return 30;
    }
    if (
        id.indexOf("larp-active_developer") === 0 ||
        id.indexOf("larp-verified_developer") === 0 ||
        id.indexOf("active_developer") !== -1 ||
        id.indexOf("verified_developer") !== -1 ||
        desc.indexOf("active developer") !== -1 ||
        desc.indexOf("early verified bot") !== -1
    ) {
        return 40;
    }
    if (id.indexOf("larp-early_supporter") === 0 || id.indexOf("early_supporter") !== -1 || desc.indexOf("early supporter") !== -1) {
        return 50;
    }
    if (isBoostBadgeRow(b, boostPayload)) return 60;

    return 100;
}

function openLarpNitroBoostSheet(innerId: string, meta: { uri: string; label: string }) {
    const isBoost = BOOST_LARP_SET[innerId];
    const title = isBoost ? "Boost" : "Nitro";
    try {
        if (typeof showConfirmationAlert === "function") {
            const body = React.createElement(
                Text,
                { style: { color: "#dcddde", fontSize: 16, lineHeight: 22 } },
                meta.label + "\n\n" + "Local preview only (Larp)."
            );
            const opts: any = {
                title,
                content: body,
                confirmText: "OK",
                onConfirm: () => {},
            };
            if (!isBoost) {
                opts.secondaryConfirmText = "discord.com/nitro";
                opts.onConfirmSecondary = () => {
                    try {
                        if (RN.Linking && typeof RN.Linking.openURL === "function") {
                            RN.Linking.openURL("https://discord.com/nitro");
                        }
                    } catch {}
                };
            }
            showConfirmationAlert(opts);
            return;
        }
    } catch {}
    try {
        showToast(meta.label, getAssetIDByName("Nitro"));
    } catch {}
}

/* ------------------------------------------------------------------ */
/* Patch-State                                                         */
/* ------------------------------------------------------------------ */

let unpatches: (() => void)[] = [];
let insideUserStoreWrap = false;
let profileStorePatched: Record<string, boolean> = {};
let UserStoreRef: any = null;

const getUserCache = new Map<string, any>();
const getUserCacheQueue: string[] = [];
const GET_USER_CACHE_MAX = 320;

function clearLarpGetUserCache() {
    getUserCache.clear();
    getUserCacheQueue.length = 0;
}

function cachedGetUser(uid: any): any {
    if (uid == null || !UserStoreRef || typeof UserStoreRef.getUser !== "function") return null;
    const k = String(uid);
    if (getUserCache.has(k)) return getUserCache.get(k);
    let gu: any = null;
    try {
        gu = UserStoreRef.getUser(k);
    } catch {}
    if (gu == null) return null;
    getUserCache.set(k, gu);
    getUserCacheQueue.push(k);
    while (getUserCacheQueue.length > GET_USER_CACHE_MAX) {
        const rem = getUserCacheQueue.shift() as string;
        getUserCache.delete(rem);
    }
    return gu;
}

function normName(s: any): string {
    if (s == null || typeof s !== "string") return "";
    let t = s.trim();
    if (t.charAt(0) === "@") t = t.slice(1);
    return t.toLowerCase();
}

function usernameMatchesSpoofPair(pun: string, matchUsername: any, replaceUsername: any): boolean {
    if (!pun) return false;
    const m = normName(matchUsername || "");
    const r = normName((replaceUsername || "").trim());
    if (!m || !r) return false;
    return pun === m || pun === r;
}

function parseAccountDateIsoMs(s: any): number | null {
    if (s == null || typeof s !== "string") return null;
    const t = s.trim();
    if (!t) return null;
    const d = Date.parse(t);
    if (!isNaN(d)) return d;
    const fr = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if (fr) {
        const day = parseInt(fr[1], 10);
        const mon = parseInt(fr[2], 10) - 1;
        const yr = parseInt(fr[3], 10);
        const hr = fr[4] != null ? parseInt(fr[4], 10) : 12;
        const mn = fr[5] != null ? parseInt(fr[5], 10) : 0;
        const u = Date.UTC(yr, mon, day, hr, mn, 0, 0);
        if (!isNaN(u)) return u;
    }
    return null;
}

function getBadgesMap(): any {
    const b = store.badges;
    if (!b || typeof b !== "object") return {};
    return b;
}

function hasAnyBadgesInMap(bm: any): boolean {
    if (!bm || typeof bm !== "object") return false;
    for (const hk in bm) if (bm[hk]) return true;
    return false;
}

function findSpoofEntryForBadges(uid: any, profileUser: any): { badgesMap: any } | null {
    const pun = profileUser && normName(profileUser.username || "");
    const cur = UserStoreRef && UserStoreRef.getCurrentUser && UserStoreRef.getCurrentUser();
    const curId = cur && cur.id;
    let others = store.otherProfiles;
    if (!Array.isArray(others)) others = [];
    for (let oi = 0; oi < others.length; oi++) {
        const op = others[oi] || {};
        if (op.userId && uid != null && String(op.userId) === String(uid)) {
            return { badgesMap: op.badges && typeof op.badges === "object" ? op.badges : {} };
        }
    }
    for (let oi = 0; oi < others.length; oi++) {
        const op2 = others[oi] || {};
        if (pun && usernameMatchesSpoofPair(pun, op2.matchUsername, op2.replaceUsername)) {
            return { badgesMap: op2.badges && typeof op2.badges === "object" ? op2.badges : {} };
        }
    }
    if (
        uid != null &&
        curId != null &&
        String(uid) === String(curId) &&
        (!pun || usernameMatchesSpoofPair(pun, store.matchUsername, store.replaceUsername)) &&
        normName(store.matchUsername || "") &&
        (store.replaceUsername || "").trim()
    ) {
        return { badgesMap: store.badges && typeof store.badges === "object" ? store.badges : {} };
    }
    return null;
}

let wrapProxyByUser = new WeakMap<object, any>();

function getUsernameSpoofReplace(user: any): string | null {
    if (!user) return null;
    const pun = normName(user.username || "");
    if (!pun) return null;
    if (normName(store.matchUsername || "") === pun && (store.replaceUsername || "").trim()) {
        return (store.replaceUsername || "").trim();
    }
    const others = store.otherProfiles;
    if (!Array.isArray(others)) return null;
    for (let gi = 0; gi < others.length; gi++) {
        const op = others[gi] || {};
        if (normName(op.matchUsername || "") === pun && (op.replaceUsername || "").trim()) {
            return (op.replaceUsername || "").trim();
        }
    }
    return null;
}

function shouldWrapUserForProxy(user: any): boolean {
    if (!user) return false;
    if (getUsernameSpoofReplace(user)) return true;
    if (parseAccountDateIsoMs(store.spoofAccountDateIso) == null) return false;
    const cur = UserStoreRef && UserStoreRef.getCurrentUser && UserStoreRef.getCurrentUser();
    if (!cur || cur.id == null || user.id == null) return false;
    return String(user.id) === String(cur.id);
}

function buildUserProxy(user: any): any {
    const prev = wrapProxyByUser.get(user);
    if (prev) return prev;

    const proxy = new Proxy(user, {
        get(t: any, p: string | symbol, recv: any) {
            const cur = UserStoreRef && UserStoreRef.getCurrentUser && UserStoreRef.getCurrentUser();
            const spoofCreatedMs = parseAccountDateIsoMs(store.spoofAccountDateIso);
            if (
                spoofCreatedMs != null &&
                cur &&
                cur.id != null &&
                t &&
                t.id != null &&
                String(t.id) === String(cur.id)
            ) {
                if (p === "createdTimestamp" || p === "createdAtTimestamp") return spoofCreatedMs;
                if (p === "createdAt" || p === "created_at") return new Date(spoofCreatedMs);
            }

            const replace = getUsernameSpoofReplace(t);
            if (!replace) return Reflect.get(t, p, recv);

            if (p === "username") return replace;

            if (p === "tag") {
                const tag = Reflect.get(t, "tag", recv);
                if (typeof tag === "string") {
                    const hash = tag.indexOf("#");
                    if (hash !== -1) return replace + tag.slice(hash);
                }
            }

            return Reflect.get(t, p, recv);
        },
        ownKeys(t: any) {
            return Reflect.ownKeys(t);
        },
        getOwnPropertyDescriptor(t: any, p: string | symbol) {
            const cur = UserStoreRef && UserStoreRef.getCurrentUser && UserStoreRef.getCurrentUser();
            const spoofCreatedMs = parseAccountDateIsoMs(store.spoofAccountDateIso);
            if (
                spoofCreatedMs != null &&
                cur &&
                cur.id != null &&
                t &&
                t.id != null &&
                String(t.id) === String(cur.id)
            ) {
                if (p === "createdTimestamp" || p === "createdAtTimestamp") {
                    return { configurable: true, enumerable: true, value: spoofCreatedMs };
                }
                if (p === "createdAt" || p === "created_at") {
                    return { configurable: true, enumerable: true, value: new Date(spoofCreatedMs) };
                }
            }

            const replace = getUsernameSpoofReplace(t);
            if (!replace) return Reflect.getOwnPropertyDescriptor(t, p);
            if (p === "username") {
                return { configurable: true, enumerable: true, value: replace };
            }
            return Reflect.getOwnPropertyDescriptor(t, p);
        },
    });
    wrapProxyByUser.set(user, proxy);
    return proxy;
}

function wrap(user: any): any {
    if (!user) return user;
    if (!shouldWrapUserForProxy(user)) return user;
    return buildUserProxy(user);
}

function larpUnpatchAll() {
    for (const up of unpatches) {
        try {
            up();
        } catch {}
    }
    unpatches = [];
    profileStorePatched = {};
    clearLarpGetUserCache();
    wrapProxyByUser = new WeakMap();
}

/* ------------------------------------------------------------------ */
/* Patches                                                             */
/* ------------------------------------------------------------------ */

function patchUsername() {
    try {
        const UserStore: any = findByStoreName("UserStore");
        UserStoreRef = UserStore || null;
        if (!UserStore || typeof UserStore.getCurrentUser !== "function") return;

        const handler = (_args: any[], ret: any) => {
            if (insideUserStoreWrap) return ret;
            insideUserStoreWrap = true;
            try {
                return wrap(ret);
            } finally {
                insideUserStoreWrap = false;
            }
        };

        unpatches.push(after("getCurrentUser", UserStore, handler));
        unpatches.push(after("getUser", UserStore, handler));
    } catch (e) {
        console.error("[Larp] patchUsername failed", e);
    }
}

function patchSnowflakeConvertersForAccountDate() {
    try {
        if (typeof findAll !== "function") return;
        const epochRe = /1420070400000/;
        const shiftRe = />>\s*22|<<\s*22n|\*\s*4194304|4423680|\/\s*4194304/;
        const maxPatches = 14;
        let patched = 0;

        const matches = (v: any): boolean => {
            if (typeof v !== "function") return false;
            const fs = Function.prototype.toString.call(v);
            if (!epochRe.test(fs) || !shiftRe.test(fs)) return false;
            if (fs.length > 2200) return false;
            return true;
        };

        const mods: any[] = (findAll as any)((exp: any) => {
            if (!exp || typeof exp !== "object") return false;
            for (const k in exp) {
                try {
                    if (!Object.prototype.hasOwnProperty.call(exp, k)) continue;
                    if (matches(exp[k])) return true;
                } catch {}
            }
            return false;
        });
        if (!mods || !mods.length) return;

        for (let mi = 0; mi < mods.length && patched < maxPatches; mi++) {
            const exp = mods[mi];
            if (!exp || typeof exp !== "object") continue;
            for (const k in exp) {
                if (patched >= maxPatches) break;
                try {
                    if (!Object.prototype.hasOwnProperty.call(exp, k)) continue;
                    if (!matches(exp[k])) continue;

                    unpatches.push(
                        after(k, exp, (args: any[], ret: any) => {
                            const ms = parseAccountDateIsoMs(store.spoofAccountDateIso);
                            if (ms == null) return ret;
                            const cur = UserStoreRef && UserStoreRef.getCurrentUser && UserStoreRef.getCurrentUser();
                            if (!cur || cur.id == null) return ret;
                            let sid: string | null = null;
                            if (args && args.length) {
                                const a0: any = args[0];
                                if (typeof a0 === "bigint") sid = String(a0);
                                else if (typeof a0 === "string" && /^\d{10,30}$/.test(a0)) sid = a0;
                                else if (typeof a0 === "number" && isFinite(a0)) sid = String(Math.trunc(a0));
                                else if (a0 != null && a0.id != null) {
                                    const ids = String(a0.id);
                                    if (/^\d{10,30}$/.test(ids)) sid = ids;
                                }
                            }
                            if (sid != null && String(sid) === String(cur.id)) return ms;
                            return ret;
                        })
                    );
                    patched++;
                } catch {}
            }
        }
    } catch (e) {
        console.error("[Larp] patchSnowflakeConvertersForAccountDate failed", e);
    }
}

function patchUserProfileRecordMemberSince() {
    try {
        const storeNames = ["UserProfileStore", "UserProfileStoreV2", "GuildMemberProfileStore"];
        const methods = ["getUserProfile", "getProfile", "getMutableUserProfiles", "getMutableUsers"];
        for (const storeName of storeNames) {
            const S: any = findByStoreName(storeName);
            if (!S) continue;
            for (const mn of methods) {
                const pkey = storeName + ":" + mn;
                if (profileStorePatched[pkey]) continue;
                if (typeof S[mn] !== "function") continue;
                profileStorePatched[pkey] = true;

                unpatches.push(
                    after(mn, S, (args: any[], ret: any) => {
                        const ms = parseAccountDateIsoMs(store.spoofAccountDateIso);
                        if (ms == null || ret == null) return ret;
                        const a0 = args && args[0];
                        const uid =
                            a0 != null && typeof a0 === "object"
                                ? a0.id || a0.userId || (a0.user && (a0.user.id || a0.user.userId))
                                : a0;
                        if (uid == null) return ret;
                        const cur = UserStoreRef && UserStoreRef.getCurrentUser && UserStoreRef.getCurrentUser();
                        if (!cur || cur.id == null) return ret;
                        if (String(uid) !== String(cur.id)) return ret;
                        if (typeof ret !== "object") return ret;
                        try {
                            const d = new Date(ms);
                            const merged: any = Object.assign({}, ret, {
                                createdAt: d,
                                memberSince: d,
                                joinedAt: d,
                                createdTimestamp: ms,
                            });
                            if (ret.user && typeof ret.user === "object") {
                                merged.user = Object.assign({}, ret.user, {
                                    createdAt: d,
                                    createdTimestamp: ms,
                                });
                            }
                            return merged;
                        } catch {
                            return ret;
                        }
                    })
                );
            }
        }
    } catch (e) {
        console.error("[Larp] patchUserProfileRecordMemberSince failed", e);
    }
}

function extractBadgeHookUid(u: any): any {
    if (u == null) return null;
    if (typeof u === "string" || typeof u === "number" || typeof u === "bigint") return u;
    if (typeof u !== "object") return null;
    if (u.userId != null) return u.userId;
    if (u.id != null) return u.id;
    if (u.user && typeof u.user === "object") {
        if (u.user.userId != null) return u.user.userId;
        if (u.user.id != null) return u.user.id;
    }
    if (u.member && u.member.user && typeof u.member.user === "object") {
        if (u.member.user.userId != null) return u.member.user.userId;
        if (u.member.user.id != null) return u.member.user.id;
    }
    return null;
}

function resolveProfileUserForBadges(u: any): any {
    if (u == null) return null;
    if (typeof u === "string" || typeof u === "number" || typeof u === "bigint") {
        if (UserStoreRef && typeof UserStoreRef.getUser === "function") {
            try {
                const g0 = cachedGetUser(u);
                if (g0 && typeof g0 === "object") return g0;
            } catch {}
        }
        return null;
    }
    if (typeof u !== "object") return null;
    const nests = [
        u,
        u.user,
        u.member && u.member.user,
        u.author,
        u.displayProfile && u.displayProfile.user,
        u.profile && u.profile.user,
    ];
    for (const n of nests) {
        if (n && typeof n === "object" && (n.username != null || n.globalName != null)) return n;
    }
    const uid = extractBadgeHookUid(u);
    if (uid != null && UserStoreRef && typeof UserStoreRef.getUser === "function") {
        try {
            const gu = cachedGetUser(uid);
            if (gu && typeof gu === "object") return gu;
        } catch {}
    }
    return u.user && typeof u.user === "object" ? u.user : u;
}

function patchBadges() {
    try {
        const mod: any = findByName("useBadges", false);
        if (!mod) return;
        let hookKey: string | null = typeof mod.default === "function" ? "default" : null;
        if (!hookKey && typeof mod.useBadges === "function") hookKey = "useBadges";
        if (!hookKey) return;

        const badgeHandler = (args: any[], ret: any) => {
            if (!ret || !Array.isArray(ret)) return ret;

            const applyNonSpoofLocalFilters = (arr: any[]) =>
                arr.filter((x) => {
                    if (!x) return true;
                    if (String(x.id || "").indexOf("larp-") === 0) return false;
                    return !shouldHideNativeBadge(x);
                });

            const u = args && args[0];
            const uid = extractBadgeHookUid(u);
            const profileUser = resolveProfileUserForBadges(u);
            const spoofCtx = findSpoofEntryForBadges(uid, profileUser);
            const badgesMap = spoofCtx && spoofCtx.badgesMap ? spoofCtx.badgesMap : {};
            if (!spoofCtx || !hasAnyBadgesInMap(badgesMap)) {
                return applyNonSpoofLocalFilters(ret);
            }

            const base = ret.filter((x: any) => !x || !x.id || String(x.id).indexOf("larp-") !== 0);

            const nitroPick = getEnabledNitroLarpIdFromMap(badgesMap);
            const boostPick = getEnabledBoostLarpIdFromMap(badgesMap);

            const hasRealNitro = nativeNitroCount(base) > 0;
            const hasRealBoost = nativeBoostCount(base) > 0;
            const stripNativeNitro = nitroPick != null && hasRealNitro;
            const stripNativeBoost = boostPick != null && hasRealBoost;
            let base2 = base;
            if (stripNativeNitro) base2 = base2.filter((x: any) => !isNativeNitroLike(x));
            if (stripNativeBoost) base2 = base2.filter((x: any) => !isGuildBoostBadge(x));
            const base3 = base2.filter((x: any) => !shouldHideNativeBadge(x));

            let nitroPayload: any = null;
            let boostPayload: any = null;
            const otherAdditions: any[] = [];
            for (const b of BADGES) {
                if (!badgesMap[b.id]) continue;
                if (NITRO_LARP_SET[b.id] && b.id !== nitroPick) continue;
                if (BOOST_LARP_SET[b.id] && b.id !== boostPick) continue;
                const row = makeBadgePayload(b);
                if (nitroPick != null && b.id === nitroPick) nitroPayload = row;
                else if (boostPick != null && b.id === boostPick) boostPayload = row;
                else otherAdditions.push(row);
            }
            const lead: any[] = [];
            if (nitroPayload) lead.push(nitroPayload);
            if (boostPayload) lead.push(boostPayload);
            const merged = lead.concat(base3).concat(otherAdditions);
            const annotated = merged.map((row, ord) => ({ row, ord }));
            annotated.sort((a, b) => {
                const ra = plateRank(a.row, nitroPayload, boostPayload);
                const rb = plateRank(b.row, nitroPayload, boostPayload);
                if (ra !== rb) return ra - rb;
                return a.ord - b.ord;
            });
            return annotated.map((x) => x.row);
        };

        unpatches.push(after(hookKey, mod, badgeHandler));
    } catch (e) {
        console.error("[Larp] patchBadges failed", e);
    }
}

function patchBadgeIconsViaJsx() {
    try {
        const jsxRuntime: any = findByProps("jsx", "jsxs");
        if (!jsxRuntime) return;

        const onJsx = (args: any[], ret: any) => {
            if (!ret || !ret.props) return ret;
            const Type = args[0];
            if (typeof Type !== "function") return ret;
            const n = Type.displayName || Type.name;
            if (store.hideNative && store.hideNative.orbBalance && n && typeof n === "string") {
                if (
                    /orb/i.test(n) &&
                    /balance|wallet|currency|amount|credits|ledger|inventory|wallet/i.test(n)
                ) {
                    const hideOrbBal = {
                        opacity: 0,
                        height: 0,
                        maxHeight: 0,
                        overflow: "hidden",
                        margin: 0,
                        padding: 0,
                        borderWidth: 0,
                    };
                    const st = ret.props.style;
                    if (Array.isArray(st)) ret.props.style = st.concat([hideOrbBal]);
                    else if (st && typeof st === "object") ret.props.style = [st, hideOrbBal];
                    else ret.props.style = hideOrbBal;
                    return ret;
                }
            }
            if (n !== "ProfileBadge" && n !== "RenderedBadge") return ret;
            const id = ret.props.id;
            if (typeof id !== "string") return ret;
            const meta = LARP_BADGE_META[id];
            if (!meta) return ret;
            ret.props.source = { uri: meta.uri };
            if (String(id).indexOf("larp-") === 0) {
                const innerId = id.slice(5);
                if (NITRO_LARP_SET[innerId] || BOOST_LARP_SET[innerId]) {
                    try {
                        delete ret.props.link;
                        delete ret.props.href;
                        delete ret.props.to;
                        delete ret.props.route;
                        delete ret.props.navigation;
                    } catch {}
                    ret.props.onPress = undefined;
                    ret.props.onLongPress = undefined;
                    ret.props.onPress = () => openLarpNitroBoostSheet(innerId, meta);
                }
                if (ret.props.description == null || ret.props.description === "") {
                    ret.props.description = meta.label;
                }
            }
            return ret;
        };

        unpatches.push(after("jsx", jsxRuntime, onJsx));
        unpatches.push(after("jsxs", jsxRuntime, onJsx));
    } catch (e) {
        console.error("[Larp] patchBadgeIconsViaJsx failed", e);
    }
}

/* ------------------------------------------------------------------ */
/* Settings-UI                                                         */
/* ------------------------------------------------------------------ */

function Settings() {
    const [, force] = React.useState(0);

    const C = {
        bg: "#313338",
        card: "#2b2d31",
        inset: "#1e1f22",
        line: "#1e1f22",
        muted: "#b5bac1",
        text: "#dbdee1",
        accent: "#5865f2",
        danger: "#f23f43",
        link: "#00a8fc",
    };

    function refresh() {
        clearLarpGetUserCache();
        force((n: number) => n + 1);
        try {
            const us: any = findByStoreName("UserStore");
            if (us && typeof us.emitChange === "function") us.emitChange();
            const profStores = ["UserProfileStore", "UserProfileStoreV2", "GuildMemberProfileStore"];
            for (const name of profStores) {
                const Ps: any = findByStoreName(name);
                if (Ps && typeof Ps.emitChange === "function") Ps.emitChange();
            }
        } catch {}
    }

    const matchValue = store.matchUsername || "";
    const replaceValue = store.replaceUsername || "";

    const h = React.createElement as any;

    function section(title: string, body: any) {
        return h(
            View,
            { style: { marginBottom: 16 } },
            h(Text, { style: { color: C.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 } }, title),
            h(
                View,
                {
                    style: {
                        backgroundColor: C.card,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#202225",
                        overflow: "hidden",
                    },
                },
                body
            )
        );
    }

    function field(label: string, value: string, key: string, isFirst?: boolean) {
        return h(
            View,
            {
                style: {
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    borderTopWidth: isFirst ? 0 : 1,
                    borderTopColor: C.line,
                },
            },
            h(Text, { style: { color: C.muted, fontSize: 12, marginBottom: 6, fontWeight: "600" } }, label),
            h(TextInput, {
                style: {
                    backgroundColor: C.inset,
                    color: C.text,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "#111214",
                    paddingHorizontal: 10,
                    paddingVertical: 9,
                    fontSize: 15,
                },
                placeholder: label,
                placeholderTextColor: "#6d6f78",
                value,
                autoCorrect: false,
                autoCapitalize: "none",
                onChangeText: (v: string) => {
                    store[key] = v;
                    refresh();
                },
            })
        );
    }

    function badgeRow(b: BadgeDef) {
        const on = !!store.badges[b.id];
        return h(
            Pressable,
            {
                key: b.id,
                onPress: () => {
                    store.badges[b.id] = !on;
                    refresh();
                    try {
                        showToast((on ? "Removed " : "Added ") + b.label, getAssetIDByName(on ? "Small" : "Check"));
                    } catch {}
                },
                style: {
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    borderTopWidth: 1,
                    borderTopColor: C.line,
                    backgroundColor: on ? "#383a40" : "transparent",
                },
            },
            h(Text, { style: { color: C.text, fontSize: 15, flex: 1 } }, b.label),
            h(Text, { style: { color: on ? C.accent : C.muted, fontSize: 13, marginLeft: 6 } }, on ? "✓" : "")
        );
    }

    function hideToggle(key: string, label: string, noTop?: boolean) {
        const on = !!store.hideNative[key];
        return h(
            Pressable,
            {
                key,
                onPress: () => {
                    store.hideNative[key] = !on;
                    refresh();
                },
                style: {
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    paddingVertical: 11,
                    borderTopWidth: noTop ? 0 : 1,
                    borderTopColor: C.line,
                },
            },
            h(Text, { style: { color: on ? C.accent : C.muted, fontSize: 14, width: 20, marginRight: 6 } }, on ? "☑" : "☐"),
            h(Text, { style: { color: C.text, fontSize: 15, flex: 1 } }, label)
        );
    }

    const primaryBadgesBlock = h(
        View,
        null,
        h(
            View,
            {
                style: {
                    paddingHorizontal: 12,
                    paddingTop: 10,
                    paddingBottom: 6,
                    borderBottomWidth: 1,
                    borderBottomColor: C.line,
                },
            },
            h(Text, { style: { color: C.muted, fontSize: 12 } }, "Primary account")
        ),
        BADGES.map(badgeRow)
    );

    const oth: any[] = store.otherProfiles || [];
    const otherProfilesBlock = h(
        View,
        null,
        oth.map((_op: any, oi: number) => {
            const op = oth[oi];
            if (!op || typeof op !== "object") return null;
            if (typeof op.badges !== "object" || op.badges === null) op.badges = {};

            const otherField = (label: string, val: any, opKey: string, firstRow?: boolean) =>
                h(
                    View,
                    {
                        style: {
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            borderTopWidth: firstRow ? 0 : 1,
                            borderTopColor: C.line,
                        },
                    },
                    h(Text, { style: { color: C.muted, fontSize: 12, marginBottom: 5, fontWeight: "600" } }, label),
                    h(TextInput, {
                        style: {
                            backgroundColor: C.inset,
                            color: C.text,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: "#111214",
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            fontSize: 15,
                        },
                        placeholder: label,
                        placeholderTextColor: "#6d6f78",
                        value: val == null ? "" : String(val),
                        autoCorrect: false,
                        autoCapitalize: "none",
                        onChangeText: (v: string) => {
                            op[opKey] = v;
                            refresh();
                        },
                    })
                );

            const otherBadgeRow = (b: BadgeDef) => {
                const on = !!op.badges[b.id];
                return h(
                    Pressable,
                    {
                        key: "o" + oi + "-" + b.id,
                        onPress: () => {
                            op.badges[b.id] = !on;
                            refresh();
                        },
                        style: {
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 12,
                            paddingVertical: 9,
                            borderTopWidth: 1,
                            borderTopColor: C.line,
                            backgroundColor: on ? "#383a40" : "transparent",
                        },
                    },
                    h(Text, { style: { color: C.text, fontSize: 14, flex: 1 } }, b.label),
                    h(Text, { style: { color: on ? C.accent : C.muted, fontSize: 13, marginLeft: 6 } }, on ? "✓" : "")
                );
            };

            return h(
                View,
                {
                    key: "otherprof-" + oi,
                    style: {
                        borderTopWidth: oi > 0 ? 1 : 0,
                        borderTopColor: C.line,
                        paddingBottom: 4,
                    },
                },
                h(
                    Text,
                    {
                        style: {
                            color: C.text,
                            fontWeight: "600",
                            fontSize: 14,
                            paddingHorizontal: 12,
                            paddingTop: 10,
                            paddingBottom: 5,
                        },
                    },
                    "Account " + (oi + 1)
                ),
                otherField("User ID (optional)", op.userId || "", "userId", true),
                otherField("Match username", op.matchUsername || "", "matchUsername"),
                otherField("Replace @handle", op.replaceUsername || "", "replaceUsername"),
                h(
                    Text,
                    { style: { color: C.muted, fontSize: 11, paddingHorizontal: 12, marginTop: 4, marginBottom: 2 } },
                    "Badges"
                ),
                BADGES.map(otherBadgeRow),
                h(
                    Pressable,
                    {
                        onPress: () => {
                            store.otherProfiles.splice(oi, 1);
                            refresh();
                        },
                        style: { marginHorizontal: 10, marginTop: 6, marginBottom: 6, paddingVertical: 9, alignItems: "center" },
                    },
                    h(Text, { style: { color: C.danger, fontWeight: "600", fontSize: 14 } }, "Remove")
                )
            );
        }),
        h(
            Pressable,
            {
                onPress: () => {
                    store.otherProfiles.push({ userId: "", matchUsername: "", replaceUsername: "", badges: {} });
                    refresh();
                },
                style: {
                    borderTopWidth: oth.length ? 1 : 0,
                    borderTopColor: C.line,
                    paddingVertical: 12,
                    alignItems: "center",
                },
            },
            h(Text, { style: { color: C.link, fontWeight: "600", fontSize: 15 } }, "Add account")
        )
    );

    return h(
        ScrollView,
        {
            style: { flex: 1, backgroundColor: C.bg },
            contentContainerStyle: { padding: 16, paddingBottom: 64 },
        },
        h(Text, { style: { color: C.text, fontSize: 20, fontWeight: "700" } }, "Larp"),
        h(Text, { style: { color: C.muted, fontSize: 13, marginTop: 2, marginBottom: 16 } }, "Client-side only."),

        section(
            "Username",
            h(View, null, [
                field("Match (without @)", matchValue, "matchUsername", true),
                field("Show as @handle", replaceValue, "replaceUsername"),
            ])
        ),

        section("Other accounts", otherProfilesBlock),

        section(
            "Member since",
            field("Date (ISO or DD/MM/YYYY)", store.spoofAccountDateIso || "", "spoofAccountDateIso", true)
        ),

        section("Badges", primaryBadgesBlock),

        section(
            "Hide native (local)",
            h(View, null, [
                hideToggle("quest", "Quest", true),
                hideToggle("orb", "Orb badge"),
                hideToggle("nitro", "Nitro / tenure"),
                hideToggle("boost", "Server boost"),
                hideToggle("orbBalance", "Orb balance row"),
                hideToggle("levelLeaf", "Level leaf / April Fools"),
                hideToggle("legacyUsername", "Originally known as"),
                h(
                    View,
                    {
                        key: "idSubstrings",
                        style: { paddingHorizontal: 12, paddingVertical: 11, borderTopWidth: 1, borderTopColor: C.line },
                    },
                    h(Text, { style: { color: C.muted, fontSize: 12, marginBottom: 6, fontWeight: "600" } }, "Hide if badge id contains"),
                    h(TextInput, {
                        style: {
                            backgroundColor: C.inset,
                            color: C.text,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: "#111214",
                            paddingHorizontal: 10,
                            paddingVertical: 9,
                            fontSize: 15,
                        },
                        placeholder: "space or comma separated",
                        placeholderTextColor: "#6d6f78",
                        value: store.hideNative.idSubstrings || "",
                        autoCorrect: false,
                        autoCapitalize: "none",
                        onChangeText: (v: string) => {
                            store.hideNative.idSubstrings = v;
                            refresh();
                        },
                    })
                ),
            ])
        ),

        h(
            Pressable,
            {
                onPress: () => {
                    store.badges = {};
                    refresh();
                    try {
                        showToast("Cleared", getAssetIDByName("trash"));
                    } catch {}
                },
                style: { marginTop: 8, paddingVertical: 12, alignItems: "center" },
            },
            h(Text, { style: { color: C.danger, fontWeight: "600", fontSize: 14 } }, "Clear all spoof badges")
        )
    );
}

/* ------------------------------------------------------------------ */
/* Plugin-Lifecycle                                                    */
/* ------------------------------------------------------------------ */

export const onLoad = () => {
    larpUnpatchAll();
    try {
        warmLarpIconAssetCache();
    } catch {}
    try {
        showToast("[Larp] " + LARP_UI_TAG + " enabled", getAssetIDByName("Check"));
    } catch {}
    patchUsername();
    patchSnowflakeConvertersForAccountDate();
    patchUserProfileRecordMemberSince();
    patchBadges();
    patchBadgeIconsViaJsx();
};

export const onUnload = () => {
    larpUnpatchAll();
};

export const settings = Settings;

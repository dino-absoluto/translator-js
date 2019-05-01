/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Copyright 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/* imports */
/* exports */
export interface WordMap {
  [id: string]: string
}

export interface WordMapFn<T> {
  [id: string]: string | T
}

export const symbols: WordMap = {
  '？': '?',
  '(': ' (',
  ')': ')',
  '（': ' (',
  '）': ')'
}

export const separators: WordMap = {
  '・': '·',
  '/': '/',
  '\u3000': '-'
}

type ParticleFn = (key: string, left: string, right: string) => string

export const particles: WordMapFn<ParticleFn> = {
  'の': (_, left, right): string => `${right} of ${left}`,
  '×': ' × ',
  'が': (_, left, right): string => `${left}'s ${right}'`,
  'は': (_, left, right): string => `${right} ${left}`,
  'な': ' ',
  'と': ' & ',
  'ではない': (_, left, right): string => `not ${left} ${right}`,
  '系': ' '
}

export const prefixes: WordMap = {
  '再': 're-',
  '実': 'true ',
  '非': 'non-',
  'ド': 'extreme ',
  '男': 'male ',
  '女': 'female ',
  '牝': 'female ',
  '雌': 'female ',
  '微': 'slight ',
  '逆': 'reverse ',
  '元': 'formerly ',
  '超': 'super ',
  'お': '',
  'ご': '',
  '御': ''
}

export const suffixes: WordMap = {
  'い': '',
  'み': '',
  '様': '',
  'さん': '',
  'あり': '',
  '有り': '',
  'もあり': '',
  '風': ' style',
  '攻め': ' top',
  '受け': ' bottom',
  '攻': ' top',
  '受': ' bottom',
  '丼': '-donburi',
  '愛': ' love',
  '系': ' type',
  'なし': ' none',
  'モノ': ' story',
  'ゲー': ' game',
  'daughter': 'girl'
}

export const phrases: WordMap = {
  /* priorities */
  '１８禁': '18+ only',
  'r18': 'R18',
  'r15': 'R15',
  /* genres */
  '恋愛': 'love',
  '異世界': 'other world',
  '現実世界': 'real world',
  'ファンタジー': 'fantasy',
  'ハイファンタジー': 'high fantasy',
  'ローファンタジー': 'low fantasy',
  '文芸': 'literature',
  '純文学': 'pure literature',
  'ヒューマンドラマ': 'human drama',
  '歴史': 'history',
  '推理': 'reasoning',
  'ホラー': 'horror',
  'アクション': 'action',
  'コメディー': 'comedy',
  'コメディ': 'comedy',
  'sf': 'SF',
  'VRゲーム': 'VR game',
  '宇宙': 'space',
  '空想科学': 'sci-fi',
  'パニック': 'panic',
  'その他': 'others',
  '童話': 'children story',
  '詩': 'song',
  'エッセイ': 'essay',
  'リプレイ': 'replay',
  'ノンジャンル': 'no genre',
  /* standard keywords */
  'ギャグ': 'gag',
  'ギャグ要素': 'gag elements',
  'シリアス': 'serious',
  'ほのぼの': 'heartwarming',
  'ダーク': 'dark',
  '主人公': 'protagonist',
  '男主人公': 'male protagonist',
  '男性主人公': 'male protagonist',
  '女主人公': 'female protagonist',
  '女性主人公': 'female protagonist',
  '人外': 'none-human',
  '魔王': 'demon king',
  '勇者': 'the brave',
  '女勇者': 'the hero girl',
  '和風': 'Japanese style',
  '西洋': 'Western',
  '中華': 'China',
  '学園': 'campus',
  '戦国': 'Warring States',
  '幕末': 'Bakumatsu',
  '明治': 'Meiji era',
  '大正': 'Taishō era',
  '明治/大正': 'Meiji/Taishō era',
  '昭和': 'Showa era',
  '平成': 'Heisei era',
  '古代': 'Ancient times',
  '中世': 'Middle Ages',
  '中世ヨーロッパ': 'Middle Ages Europe',
  '近世': 'early-modern',
  '近代': 'near-modern',
  '現代': 'modern',
  '未来': 'future',
  'ロボット': 'robot',
  'アンドロイド': 'android',
  '職業もの': 'jobs',
  '職業': 'jobs',
  '仕事': 'work',
  'ハーレム': 'harem',
  '逆ハー': 'reverse harem',
  '逆ハーレム': 'reverse harem',
  '群像劇': 'multi protagonists',
  'チート': 'cheat',
  '内政': 'dosmetic affairs',
  '魔法': 'magic',
  '冒険': 'adventure',
  'ミリタリー': 'military',
  '日常': 'everyday',
  'ハッピーエンド': 'happy ending',
  'バッドエンド': 'bad ending',
  'グルメ': 'gourmet',
  '青春': 'youth',
  'ゲーム': 'game',
  '超能力': 'ESP',
  'タイムス': 'TIME',
  'リップ': 'LEAP',
  'タイムトラベル': 'TIME TRAVEL',
  'ダンジョン': 'DUNGEON',
  'パラレルワールド': 'PARALLEL WORLD',
  'タイムリープ': 'TIME LEAP',
  '政略結婚': 'political marriage',
  '異類婚姻譚': 'interracial marriage',
  '身分差': 'social status difference',
  '年の差': 'age difference',
  '歳の差': 'age difference',
  '悲恋': 'blighted love',
  'ヒストリカル': 'historical',
  '乙女ゲーム': 'maiden game',
  '悪役令嬢': 'villainess',
  'オフィスラブ': 'office romance',
  'スクールラブ': 'school romance',
  '古典恋愛': 'classic rommance',
  'オリジナル戦記': 'original war chronicle',
  '伝奇': 'romance (fiction)',
  // 'ヒューマンドラマ': 'human drama',
  'ハードボイルド': 'hard-boiled',
  '私小説': '1st person narrator',
  '三人称': '3rd person',
  'ホームドラマ': 'soap opera',
  'if戦記': 'What-if war chronicle',
  '史実': 'historical fact',
  '時代小説': 'historical novel',
  '逆行転生': 'backward reincarnation',
  'ミステリー': 'mystery',
  'サスペンス': 'suspense',
  '探偵小説': 'detective',
  'スプラッタ': 'splatter',
  '怪談': 'ghost story',
  'サイコホラー': 'spycho horror',
  '異能力バトル': 'abnormal power battle',
  'ヒーロー': 'hero',
  'スパイ': 'spy',
  // '冒険': 'adventure',
  'ラブコメ': 'rom-com',
  '近未来': 'near future',
  '人工知能': 'AI',
  '電脳世界': 'cyber world',
  // 'VRMMO': 'VRMMO',
  'スペースオペラ': 'space opera',
  'エイリアン': 'alient',
  'サイバーパンク': 'cyberpunk',
  'スチームパンク': 'steampunk',
  'ディストピア': 'dystopia',
  'タイムマシン': 'time machine',
  '怪獣': 'giant monster',
  '天災': 'disaster',
  'バイオハザード': 'biohazard',
  'パンデミック': 'pandemic',
  'サバイバル': 'survival',
  // more keywords
  '残念な描写あり': 'disappointing depiction',
  '残酷な描写あり': 'cruel depiction',
  '転生': 'reincarnation',
  '転移': 'teleport',
  '生まれ変わり': 'reborn',
  '世界': 'world',
  '異世界召喚': 'otherworld summon',
  '異世界転生': 'otherworld reincarnation',
  'モブキャラ転生': 'mob-character reincarnation',
  '魔物転生': 'monster reincarnation',
  'クラス転移': 'class teleport',
  '異世界転移': 'otherworld teleport',
  '主人公最強': 'strongest protagonist',
  '仲間最強': 'strongest comrade',
  '不信の主人公': 'distrustful protagonist',
  '俺': 'me',
  '仲間': 'comrade',
  'TUEEE': 'STRONG!!',
  'TUEEEE': 'STRONG!!',
  '配下': 'subordinate',
  '中二病': 'chunnibyou',
  '厨二病': 'chunnibyou',
  '一人称': '1st person',
  '鬼畜': 'brute',
  '不器用': 'clumsy',
  'オリジナル': 'original',
  '要素': 'factors',
  // state
  'のほほん': 'nonchalant',
  '優しい': 'gentle',
  'ゆっくり': 'slowly',
  'サクサク': 'quickly',
  'たまに': 'occasionally',
  '時折': 'sometimes',
  '時々': 'sometimes',
  'いずれ': 'eventually',
  'ときどき': 'sometimes',
  '複数': 'multiple',
  '多数': 'lots',
  '多少': 'somewhat',
  '予定': 'planned',
  'になる予定': 'planned',
  'インスタント': 'instant',
  'ぐだぐだ': 'exhausted',
  '割と': 'relatively',
  'やや': 'a little',
  '基本': 'basically',
  '少々': 'just a little',
  // common words
  '義理の': 'step',
  '店': 'shop',
  '自己': 'self',
  '評価': 'evaluation',
  '低': 'low',
  '強': 'strong',
  'キャラ': 'character',
  '酒': 'alcohol',
  '逆行': 'backward',
  'クール': 'COOL',
  'コピー': 'COPY',
  '訓練': 'training',
  '最初から': 'start from',
  '出オチ': 'punchline',
  '無属性': 'none-attribute',
  '火': 'fire',
  '水': 'water',
  // '風': 'wind',
  '地': 'earth',
  '光': 'light',
  '闇': 'darkness',
  '白': 'white',
  '氷': 'ice',
  '雷': 'lightning',
  '豚': 'pig',
  '特殊': 'special',
  '能力': 'ability',
  '街': 'town',
  'デブ': 'chubby',
  '天然': 'natural airhead',
  '表現': 'expression',
  '出会い': 'encounter',
  '衰退した': 'declined',
  '技術': 'technology',
  'ライフル': 'RIFFLE',
  'エア': 'AIR',
  'ケンカップル': 'quarrelsome duo',
  'バグ': 'BUG',
  '回': 'episode',
  'そのうち': 'soon',
  'やがて': 'soon',
  '災害': 'calamity',
  'ツリー': 'TREE',
  '解雇': 'dismiss',
  '自由のために': 'for freedom',
  '毎日': 'daily',
  '日本刀': 'Japanese katana',
  '神器': 'sacred treasure',
  '可能': 'possible',
  '不可': 'impossible',
  'ログアウト': 'LOG OUT',
  'ストーカー': 'STALKER',
  '引きこもり': 'shut-in',
  '眷属': 'household',
  '攻略': 'capture',
  '仮想': 'imagined',
  '捨てられ': 'abandoned',
  'アラサー': '30s',
  '契約': 'contract',
  '読める': 'read',
  '三国志': 'Records of the Three Kingdoms',
  '帰り': 'return',
  '幼児': 'toddler',
  'リア充': 'riajuu',
  'アホ': 'moron',
  'アホの': 'stupid',
  'ある意味': 'in a sense',
  '大': 'great',
  '釣り': 'fishing',
  '縛り': 'shackled',
  'セカンド': 'second',
  'ライフ': 'life',
  '覚醒': 'awaken',
  'ユニーク': 'UNIQUE',
  'ガチャ': 'GACHA',
  '集団': 'group',
  '無敵': 'unrivaled',
  'ポンコツ': 'piece of junk',
  'ダブル': 'DOUBLE',
  'アップ': 'UP',
  'ポスト': 'POST',
  'アポカリプス': 'APOCALYPSE',
  '連続': 'continuous',
  'ソフト': 'SOFT',
  'ボクっ娘': 'bokuko',
  '無様': 'awkward',
  '大量': 'massive',
  'ストーリー': 'story',
  '重視': 'emphasized',
  '電車': 'train',
  '鉄道': 'railroad',
  '同居': 'cohabiting',
  '精神的': 'mentally',
  '不定期': 'irregular',
  '更新': 'update',
  'デス': 'death',
  '決定': 'decided',
  '魔': 'demon',
  '邪': 'evil',
  '眼': 'eyes',
  '制': 'system',
  'ストレス': 'stress',
  'フリー': 'free',
  'プレイ': 'play',
  '喪失': 'loss',
  '巨大': 'giant',
  '架空': 'fictitious',
  '保険': 'guaranteed',
  '観念': 'concept',
  '展開': 'development',
  'ご都合': 'convenient',
  '現地': 'local',
  '現地人': 'native',
  '筋肉': 'muscle',
  'ガチムチ': 'muscular',
  'づくり': 'making',
  '作り': 'making',
  '属性': 'attribute',
  '腹黒': 'black-hearted',
  '睡眠': 'sleep',
  '多分': 'lots',
  '過ぎ去りし': 'passing',
  '気味': 'tendency',
  '専属': 'exclusive',
  'rpg': 'RPG',
  '知識': 'knowledge',
  '掲示板': 'BBS',
  'は一人': 'is one',
  '大型犬': 'big dog',
  'タイプ': 'type',
  '失われた': 'lost',
  'が来た': 'is here',
  'ネット': 'net',
  'スーパー': 'supermarket',
  'ペット': 'pet',
  'クズ': 'garbage',
  'ハーフ': 'half',
  'ババァ': 'baba',
  'ババア': 'baba',
  'トリップ': 'trip',
  'スタート': 'start',
  '常識': 'common sense',
  '改変': 'alteration',
  '攻': 'advance',
  '時代': 'period',
  // number
  '〇': '0',
  '零': '0',
  '一': '1',
  '二': '2',
  '三': '3',
  '四 ': '4',
  '五': '5',
  '六': '6',
  '七': '7',
  '八': '8',
  '九': '9',
  '十': '10',
  '廿': '20',
  '卅': '30',
  '百': 'hundred',
  '千': 'thousand',
  '万': 'ten thousand',
  // theme
  '黒髪': 'black hair',
  'ネトゲ': 'online game',
  '無機物': 'inorganic',
  '偽善者': 'hypocrite',
  '生活': 'life',
  '隠居': 'retired',
  '観光': 'sightseeing',
  '探索': 'explore',
  '若返り': 'rejuvenation',
  '転職': 'career change',
  '野球': 'baseball',
  '擬人化': 'personification',
  'マイペース': 'MY-PACE',
  '豹変する': 'complete changed',
  '甘える': 'act spoiled',
  '無自覚': 'unaware',
  '努力': 'hardworking',
  '寄生': 'parasite',
  '切ない': 'heartrending',
  '下ネタ': 'dirty jokes',
  'チーレム': 'cheat-class harem',
  '前世': 'previous life',
  'のんびり': 'carefree',
  'オカルト': 'OCULT',
  'ループ': 'loop',
  'まったり': 'laid-back',
  'いじめ': 'bully',
  '強引': 'overbearing',
  '依存': 'dependence',
  '甘やかし': 'pamper',
  '王道': 'royal road',
  'モブ': 'mob',
  '変身': 'transform',
  '育成': 'rearing',
  '巻き込まれ': 'got involved',
  'やり直し': 'redo',
  'サイコパス': 'psychopath',
  'ダイエット': 'diet',
  '子育て': 'child-rearing',
  '飯テロ': 'food porn',
  'つまらない': 'tedious',
  'ありきたり': 'common',
  'パロ': 'parody',
  'テンプレ': 'template',
  'シュール': 'surreal',
  'どん底': 'bottom',
  '成り上がり': 'upstart',
  '立ち向かう': 'oppose',
  '御都合主義': 'opportunism',
  'ご都合主義': 'opportunism',
  '滅亡回避': 'downfall evasion',
  'ざまぁ': 'serve you right!',
  'ざまあ': 'serve you right!',
  'ザマァ': 'serve you right!',
  'お菓子': 'confections',
  '食事': 'food',
  '料理': 'cooking',
  'もふもふ': 'mofumofu',
  'モフモフ': 'MOFUMOFU',
  'スローライフ': 'slow life',
  '貧乏': 'poverty',
  'ドタバタ': 'slapstick',
  '誤認': 'misrecognition',
  '勘違い': 'misunderstanding',
  'すれ違い': 'missed meeting',
  '迷宮': 'labyrinth',
  '不老不死': 'perpetual youth',
  'あべこべ': 'inversed',
  'スポーツ': 'sport',
  '部活': 'clubs',
  '最強': 'strongest',
  '最弱': 'weakest',
  '最恐': 'scariest',
  '無双': 'peerless',
  '無能力': 'incompetence',
  '記憶喪失': 'amnesia',
  '時間停止': 'time stop',
  '旅': 'travel',
  '旅行': 'journey',
  '不良': 'delinquent',
  '頭脳': 'intelectual',
  '金髪': 'blonde hair',
  '勇者召喚': 'hero summoning',
  // negative, comback
  '不遇': 'misfortuned',
  '失格': 'disqualified',
  '廃嫡': 'disinherited',
  '逆転': 'reversal',
  '報われる努力': 'rewarded effort',
  '絶望': 'despair',
  '追放': 'exile',
  '裏切り': 'betrayal',
  '復讐': 'revenge',
  '狂気': 'madness',
  '悪堕ち': 'fall to evil',
  '陰謀': 'conspiracy',
  '悲劇': 'tragedy',
  '罠': 'trap',
  '人体実験': 'human experiment',
  // cautions
  'カニバリズム': 'CANNIBALISM',
  'グロ': 'GROSTESQUE',
  '注意': 'CAUTION',
  // 'グロ注意': 'GROSTESQUE CAUTION',
  // management
  '暗躍': 'secret manoeuvres',
  '宗教': 'religion',
  '勝利': 'victory',
  '軍団': 'armed group',
  '軍隊': 'army',
  '革命': 'revolution',
  '吸収': 'absorbtion',
  '領主': 'feudal lord',
  '国家': 'country',
  '民族': 'ethnic',
  '開拓': 'reclamation',
  '領地': 'territory',
  '経営': 'management',
  '運営': 'administration',
  '農業': 'agriculture',
  '政略': 'politics',
  '政治': 'politics',
  '村づくり': 'village building',
  '村作り': 'village building',
  '建国': 'kingdom founding',
  '国家運営': 'country management',
  '経済': 'economics',
  '外交': 'diplomacy',
  '戦争': 'war',
  '戦記': 'war chronicle',
  '戦略': 'strategy',
  '謀略': 'stratagem',
  '戦術': 'tactics',
  '商品売買': 'product trading',
  '生産': 'production',
  '物作り': 'crafting',
  'ものづくり': 'crafting',
  '生産職': 'craftman',
  '葛藤': 'conflict',
  '商売': 'commerce',
  'ビジネス': 'BUSINESS',
  '企業': 'enterprise',
  '組織': 'organization',
  // location
  'ブックス': 'bookstore',
  '田舎': 'countryside',
  '喫茶店': 'coffeehouse',
  '自衛隊': 'self-defence force',
  '生徒会': 'student council',
  '女子高': 'girls\' high school',
  '高校': 'high school',
  '中学': 'middle school',
  '小学': 'grade school',
  '大学': 'college',
  '学校': 'school',
  '日本': 'Japan',
  '魔術学校': 'magic school',
  '魔法学園': 'magic academy',
  '学院': 'academy',
  '学園都市': 'university town',
  'ゲームの世界': 'game world',
  '現代社会': 'modern society',
  '教会': 'church',
  'ギルド': 'guild',
  '騎士団': 'knight order',
  '冒険者ギルド': 'adventurer guild',
  '後宮': 'inner palacer',
  // system
  'アイテム': 'ITEM',
  'ジョブ': 'JOB',
  '死に戻り': 'return by death',
  'vrmmo': 'VRMMO',
  'レベル': 'level',
  'アイテムボックス': 'item box',
  'ステータス': 'status',
  'スキル': 'skill',
  'ステータスとスキル': 'status & skill',
  'sssランク': 'SSS-rank',
  'エロゲ': 'ero-game',
  '成長': 'growth',
  '進化': 'evolution',
  '変化': 'mutation',
  '憑依': 'possession',
  // objects
  '宇宙船': 'spaceship',
  'オートマタ': 'AUTOMATA',
  '人形': 'doll',
  '制服': 'uniform',
  '攻略本': 'strategy guide',
  'エクスカリバー': 'Excalibur',
  'チート商品': 'cheat items',
  'ポーション': 'potion',
  '薬草': 'medicinal herb',
  '魔道具': 'magic tool',
  '魔導具': 'magic tool',
  '魔石': 'magic stone',
  '兵器': 'armaments',
  '武器': 'weapon',
  '防具': 'armor',
  '魔剣': 'magic sword',
  '聖剣': 'holy sword',
  '銃': 'gun',
  '銃撃': 'gun',
  '散弾': 'shot',
  '散弾銃': 'shotgun',
  '飛行船': 'airship',
  'カクテル': 'cocktail',
  // combat & abilities
  '鑑定': 'appraisal',
  '戦闘': 'combat',
  'バトル': 'battle',
  '戦': 'fight',
  '戦い': 'fight',
  '盾': 'shield',
  '剣': 'sword',
  '刀': 'katana',
  '魔力': 'magic power',
  '物理攻撃': 'physical attack',
  '魔法攻撃': 'magical attack',
  '回復': 'recovery',
  '回復職': 'healer',
  'ヒーラー': 'healer',
  '神官': 'priest',
  '支援職': 'supporter',
  // '魔法': 'magic',
  '異能': 'superpower',
  '剣と魔法': 'sword & magic',
  '軍人': 'soldier',
  '剣士': 'swordman',
  '戦士': 'warrior',
  '傭兵': 'mercenary',
  '忍者': 'ninja',
  '魔導': 'sorcery',
  '魔術': 'wizardry',
  '魔術師': 'wizard',
  '魔法使い': 'magician',
  '魔導師': 'sorcerer',
  '魔導士': 'sorcerer',
  '呪い': 'curse',
  'テイマー': 'tamer',
  'テイム': 'tame',
  '従魔': 'tamed creatures',
  '使い魔': 'familiar',
  '賢者': 'sage',
  '剣聖': 'sword saint',
  '剣術': 'swordmanship',
  '死魔法': 'necromancy',
  '死霊術': 'necromancy',
  '武術': 'martial art',
  '陰陽師': 'onmyouji',
  '陰陽道': 'yin & yang',
  '式神': 'shikigami',
  '格闘技': 'unarmed combat',
  '召喚士': 'summoner',
  'サモナー': 'SUMMONER',
  '召喚': 'summon',
  '狩猟': 'hunting',
  '希少職': 'rare job',
  '錬金': 'alchemy',
  '錬金術': 'alchemy',
  '錬金術師': 'alchemist',
  '薬師': 'pharmacist',
  '鍛冶': 'smithing',
  '鍛冶師': 'blacksmith',
  '料理人': 'chef',
  '催眠': 'hypnosis',
  '洗脳': 'brainwash',
  // species
  '狐': 'fox',
  'キツネ': 'FOX',
  'モンスター': 'MONSTER',
  'スライム': 'SLIME',
  'ドラゴン': 'DRAGON',
  'フェンリル': 'FENRIR',
  'オーク': 'ORC',
  'ゴブリン': 'GOBLIN',
  'サキュバス': 'SUCCUBUS',
  '淫魔': 'succubus',
  'ゴーレム': 'GOLEM',
  'ゾンビ': 'ZOMBIE',
  'アンデッド': 'UNDEAD',
  'ネクロマンサー': 'NECROMANCER',
  'ホムンクルス': 'HOMUNCULUS',
  'リザードマン': 'LIZARDMAN',
  '竜': 'dragon',
  '龍': 'Chinese dragon',
  '獣': 'animal',
  '狼': 'wolf',
  '猫': 'cat',
  '犬': 'dog',
  '悪魔': 'devil',
  '魔物': 'magical being',
  '魔獣': 'magic beast',
  '妖怪': 'youkai',
  '天狗': 'tengu',
  '精霊': 'spirit',
  '幽霊': 'spectre',
  '吸血鬼': 'vampire',
  '妖精': 'fairy',
  'フェアリー': 'FAIRY',
  '異種族': 'variant species',
  '獣人': 'beastfolk',
  '人狼': 'werewolf',
  'ドワーフ': 'DWARF',
  'エルフ': 'ELF',
  'ダークエルフ': 'DARK ELF',
  '人造人間': 'artificial human',
  '魔族': 'demonfolk',
  '亜人': 'demi-human',
  '人魚': 'mermen',
  '竜人': 'dragonfolk',
  // characters: male
  'ダルマ': 'daruma',
  'おっさん': 'ossan',
  'オッサン': 'ossan',
  'ヒモ': 'gigolo',
  '皇帝': 'emperor',
  '王': 'king',
  '王子': 'prince',
  '王太子': 'crown prince',
  '執事': 'butler',
  // characters: neutral
  'ヘタレ': 'wuss',
  'ハンター': 'HUNTER',
  'オタク': 'OTAKU',
  'マスター': 'MASTER',
  'ゲーマー': 'GAMER',
  'バーサーカー': 'BERSERKER',
  'サラリーマン': 'SALARYMAN',
  '悪役': 'baddie',
  '脇役': 'supporting role',
  '社畜': 'corporate slave',
  '神': 'god',
  '転生者': 'reincarnator',
  '暗殺者': 'assassin',
  '殺人': 'killer',
  '王族': 'royalty',
  '王侯': 'royalty',
  '王侯貴族': 'royalty and nobility',
  '公爵': 'duke',
  '侯爵': 'maquis',
  '伯爵': 'count',
  '貴族': 'noble',
  '御曹司': 'son of distinguished familiy',
  '騎士': 'knight',
  '冒険者': 'adventurer',
  '商人': 'merchant',
  '村人': 'villager',
  '盗賊': 'bandit',
  'Sランク冒険者': 'S-rank adventurer',
  '奴隷': 'slave',
  '英雄': 'hero',
  '教師': 'teacher',
  '先生': 'sensei',
  '師匠': 'shishou',
  '生徒': 'student',
  '学生': 'student',
  '同級生': 'classmate',
  '高校生': 'high-schooler',
  '中学生': 'middle-schooler',
  '小学生': 'grade-schooler',
  '大学生': 'college student',
  '大隊長': 'battalion commander',
  '幼馴染': 'childhood friend',
  '幼馴染み': 'childhood friend',
  '幼なじみ': 'childhood friend',
  '外国人': 'foreigner',
  '従者': 'follower',
  // characters: female
  'ヒロイン': 'heroine',
  'チョロイン': 'choroin',
  '女神': 'goddess',
  '女神さま': 'goddess',
  '天使': 'angel',
  '聖女': 'saintess',
  '姫': 'hime',
  '王妃': 'queen consort',
  '女王': 'queen',
  '王女': 'princess',
  '女公爵': 'duchess',
  '令嬢': 'young lady',
  'お嬢様': 'ojou-sama',
  '女騎士': 'female knight',
  '巫女': 'miko',
  '魔女': 'witch',
  '魔法少女': 'magical girl',
  '獣娘': 'beast girl',
  'メイド': 'maid',
  '侍女': 'lady attendant',
  '女教師': 'female teacher',
  '女子大生': 'college girl',
  '女子大学生': 'college girl',
  '女子高生': 'high-school girl',
  '女子中学生': 'middle-school girl',
  '女子小学生': 'grade-school girl',
  'モデル': 'model',
  'アイドル': 'idol',
  '少年': 'boy',
  '少女': 'girl',
  '幼女': 'little girl',
  'のじゃロリ': 'noja loli',
  '乙女': 'maiden',
  'ちびっ子': 'chibiko',
  '女性': 'woman',
  '美少女': 'beautiful girl',
  '合法': 'legal',
  'モン娘': 'monster girl',
  'ケモ耳': 'animal ears',
  'ケモミミ': 'animal ears',
  '耳': 'ears',
  '猫耳': 'cat ears',
  '猫耳娘': 'cat ears girl',
  'ギャル': 'gyaru',
  'ビッチ': 'bitch',
  '悪女': 'wicked woman',
  '未亡人': 'widow',
  '娼婦': 'prostitute',
  '売春': 'prostitution',
  '浮気': 'affair',
  // characters: relations
  'パパ': 'papa',
  'ママ': 'mama',
  '父': 'father',
  '父親': 'father',
  '母': 'mother',
  '母親': 'mother',
  '娘': 'daughter',
  '母娘': 'mother and daughter',
  '母息子': 'mother and son',
  '息子': 'son',
  '兄妹': 'older brother and younger sister',
  '姉': 'big sister',
  '姉弟': 'big sister and little brother',
  '妹': 'younger sister',
  '兄弟': 'brothers',
  '姉妹': 'sisters',
  '姪': 'niece',
  '姪っ子': 'niece',
  '双子': 'twin',
  '嫁': 'wife',
  '側室': 'concubine',
  '夫婦': 'married couple',
  '義母': 'mother-in-law',
  '義弟': 'younger brother-in-law',
  '義妹': 'sister-in-law',
  '義兄弟': 'brothers-in-law',
  '少年少女': 'boys & girls',
  '男女比': 'gender ratio',
  '男女': 'men & women',
  '子': 'child',
  '主従': 'master & servant',
  '後輩': 'kouhai',
  '先輩': 'senpai',
  '社会人': 'working adult',
  // friendship
  '友達': 'friends',
  '友情': 'friendship',
  // love: family
  '親馬鹿': 'doting parent',
  '親バカ': 'doting parent',
  '家族': 'family',
  '馬鹿': 'idiot',
  'バカ': 'idiot',
  // love: romance
  '愛され': 'beloved',
  '修羅場': 'Shubara',
  '異種': 'interracial',
  '一途': 'wholehearted',
  '初恋': 'first love',
  '恋': 'love',
  '純愛': 'pure love',
  '両想い': 'mutual love',
  '片思い': 'unrequited love',
  '両片思い': 'mutual unrequited love',
  '両片想い': 'mutual unrequited love',
  'イチャイチャ': 'flirting',
  'いちゃいちゃ': 'flirting',
  'イチャラブ': 'flirty-lovey',
  'いちゃラブ': 'flirty-lovey',
  'いちゃらぶ': 'flirty-lovey',
  '三角関係': 'love triangle',
  '禁断の恋': 'forbidden love',
  '溺愛': 'blind love',
  '嫉妬': 'envy',
  '百合': 'yuri',
  'レズ': 'lez',
  'ガールズラブ': 'girls love',
  'ボーイズラブ': 'boys love',
  'ボーイミーツガール': 'boy meets girl',
  'オメガバース': 'Omegaverse',
  '腐女子': 'rotten woman',
  'gl': 'GL',
  'bl': 'BL',
  'sm': 'SM',
  'マゾ': 'masochist',
  'サド': 'sadist',
  '婚約': 'engagement',
  '婚約者': 'betrothed',
  '婚約破棄': 'engagement discarded',
  '運命': 'destiny',
  '婚活': 'marriage hunting',
  '結婚': 'marriage',
  '再婚': 'remarriage',
  'ツンデレ': 'tsundere',
  'ヤンデレ': 'yandere',
  'クーデレ': 'kuudere',
  '鈍感': 'thickheaded',
  '学園コメディ': 'school comedy',
  'ブラコン': 'brocon',
  'シスコン': 'siscon',
  'マザコン': 'mothercon',
  'ファザコン': 'fathercon',
  'らぶらぶ': 'lovey-dovey',
  'ラブラブ': 'lovey-dovey',
  '女性視点': 'girl POV',
  '男性視点': 'boy POV',
  'ショタ': 'shota',
  'おねショタ': 'onee-shota',
  'ショタおね': 'shota-onee',
  // characteristics
  '服従': 'obedience',
  'ボーイッシュ': 'boyish',
  '可愛い': 'cute',
  '年上': 'older',
  '年下': 'younger',
  '絶倫': 'peerless vigor',
  '変態': 'pervert',
  '執着': 'obsession',
  '羞恥': 'shyness',
  '美形': 'beauty',
  '美人': 'beauty',
  '美女': 'beauty',
  '美醜': 'beauty & ugliness',
  '平凡': 'average',
  '地味': 'plain',
  '巨乳': 'big boobs',
  '爆乳': 'explosive boobs',
  '貧乳': 'tiny breasts',
  '巨根': 'big dick',
  '体格差': 'physique difference',
  '身長差': 'height difference',
  'ロリ': 'loli',
  'ロリコン': 'lolicon',
  'エロ': 'ero',
  'エロコメ': 'ero comedy',
  '甘々': 'sugary',
  'あまあま': 'sugary',
  'ふたなり': 'futanari',
  'セフレ': 'sex friend',
  '性奴隷': 'sex slave',
  '牝奴隷': 'female slave',
  '雌奴隷': 'female slave',
  '肉便器': 'meat toilet',
  '人妻': 'married woman',
  '熟女': 'mature lady',
  '処女': 'virgin',
  '非処女': 'non-virgin',
  '童貞': 'virgin♂',
  '貞操': 'chasity',
  '母乳': 'mother milk',
  '番': 'spouse',
  '全裸': 'naked',
  '肉体': 'body',
  '改造': 'remodeling',
  // sexual
  'キス': 'KISS',
  'アヘ顔': 'ahegao',
  'んほぉ': 'Nhoooh!',
  'えっち': 'ecchi',
  '風俗': 'sex service',
  '姦': 'rape',
  'コスプレ': 'cosplay',
  '男の娘': 'male girl',
  '男装': 'male clothing',
  '女装': 'female clothing',
  'イケメン': 'handsome man',
  'tsf': 'TSF',
  'ts': 'TS',
  '女→男': 'female→male',
  '男→女': 'male→female',
  '女体化': 'feminization',
  '姫初め': 'princess first time',
  'おしっこ': 'wee-wee',
  'オナニー': 'jerk off',
  '自慰': 'masturbation',
  'セックス': 'sex',
  '無理矢理': 'forcefully',
  '無理やり': 'forcefully',
  'メスイキ': 'female cumming',
  '強制': 'coered',
  'リョナ': 'ryona',
  'レイプ': 'rape',
  '乱交': 'group sex',
  '輪姦': 'gang rape',
  '痴漢': 'molest',
  '露出': 'exposure',
  '緊縛': 'bondage',
  'お仕置き': 'punishment',
  '躾': 'discipline',
  '開発': 'development',
  '寝取り': 'netori',
  '寝取らせ': 'let cuckolding',
  '寝取られ': 'cuckolding',
  'ネトラレ': 'cuckolding',
  'スカトロ': 'scatology',
  '拘束': 'restraint',
  '監禁': 'confinement',
  '和姦': 'intercourse',
  'イラマチオ': 'irrumatio',
  'フェラチオ': 'fellatio',
  'フェラ': 'fellatio',
  '手コキ': 'handjob',
  'パイズリ': 'titty fuck',
  '中出し': 'creampie',
  '孕ませ': 'impregnate',
  '産卵': 'egg-laying',
  '妊活': 'conceive',
  '妊娠': 'pregnancy',
  '出産': 'childbirth',
  '調教': 'break-in',
  '近親相姦': 'incest',
  '性転換': 'sex change',
  '媚薬': 'aphrodisiac',
  '恥辱': 'shame',
  '凌辱': 'disgrace',
  '陵辱': 'assault',
  '強姦': 'violate',
  '拷問': 'torture',
  '言葉責め': 'verbal abuse',
  '快楽堕ち': 'fall in pleasure',
  'らぶえっち': 'lovers echi',
  'じれじれ': 'teasing',
  '淫乱': 'lecherous',
  '淫語': 'dirty talk',
  '淫紋': 'lewd clothes',
  '触手': 'tentacle',
  'ボテ腹': 'pregnant belly',
  '精液ボテ': 'semen belly',
  '巨尻': 'big butt',
  '尻': 'butt',
  '子宮': 'womb',
  'おっぱい': 'boobs',
  'アナル': 'anal',
  '浣腸': 'anema',
  '精液': 'semen',
  '搾乳': 'milking',
  '生ハメ': 'raw fuck',
  '獣姦': 'beastiality',
  '屍姦': 'necrophilia',
  '膣内': 'intravaginal',
  '射精': 'ejacuation',
  '潮吹き': 'squirt',
  '絶頂': 'climax',
  'チン負け': 'succumbed to dick',
  // '家族愛': 'family love',
  // website
  'アイリス': 'Iris',
  'ネット小説': 'Webnovel',
  '感想': 'Impression',
  '初投稿': 'first contribution',
  '作品': 'work',
  '挿絵': 'picture',
  '挿絵あり': 'has pictures',
  '大賞': 'Big Trophy',
  '賞': 'Award',
  '受賞作': 'winner',
  'なろうコン': 'Let\'s CONTEST',
  '小説コン': 'novel CONTEST',
  '本編': 'main story',
  'ライトノベル': 'light novel',
  'コミカライズ': 'comic adaptation',
  'コミカライズ化': 'comic adaptation',
  '電子書籍': 'ebook',
  '電子書籍化': 'ebook adaptation',
  '書籍化': 'book adaptation',
  '短編集': 'short stories collection',
  '完結済': 'completed',
  '完結': 'completed',
  '希望': 'candidate',
  '漫画': 'manga',
  'アニメ': 'anime',
  '二次創作': 'derived work',
  // (quotes)
  '(笑)': '(LOL)',
  // names
  '織田': 'Oda',
  '信長': 'Nobunaga',
  // others
  '男尊女卑': 'male chauvinism',
  '音楽': 'music',
  '花畑': 'flower field',
  '植物学': 'botany',
  '地質学': 'geology',
  '豆知識': 'trivia'
}

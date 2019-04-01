/**
 * @file Words
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * This file is part of Translator Toolkit.
 *
 * Translator Toolkit is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Translator Toolkit is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Translator Toolkit.  If not, see <http://www.gnu.org/licenses/>.
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
  '\\(': ' )',
  '\\)': ')'
}

export const separators: WordMap = {
  '・': '·',
  '\u3000': '-'
}

type ParticleFn = (key: string, left: string, right: string) => string

export const particles: WordMapFn<ParticleFn> =  {
  'の': (_, left, right) => `${right} of ${left}`,
  '×': ' × ',
  'が': (_, left, right) => `${left}'s ${right}'`,
  'は': (_, left, right) => `${right} ${left}`,
  'な': ' '
}

export const prefix: WordMap = {
  'ド': 'extreme ',
  '男': 'male ',
  '女': 'female ',
  '微': 'slight ',
  '逆': 'reverse ',
  '元': 'formerly ',
  'お': '',
}

export const suffix: WordMap = {
  '風': ' style',
  '攻め': ' top',
  '受け': ' bottom',
  '様': '',
  'さん': '',
  'あり': '',
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
  '女主人公': 'female protagonist',
  '人外': 'none-human',
  '魔王': 'demon king',
  '勇者': 'the brave',
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
  '近世': 'early modern',
  '近代': 'modern',
  '現代': 'present',
  '未来': 'future',
  'ロボット': 'robot',
  'アンドロイド': 'android',
  '職業もの': 'jobs',
  'ハーレム': 'harem',
  '逆ハーレム': 'reverse-harem',
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
  'タイムトラベル': 'time travel',
  'ダンジョン': 'dungeon',
  'パラレルワールド': 'parallel world',
  'タイムリープ': 'time leap',
  '異類婚姻譚': 'interracial marriage',
  '身分差': 'social status difference',
  '年の差': 'age difference',
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
  '残酷な描写あり': 'cruel depiction',
  '転生': 'reincarnation',
  '転移': 'teleport',
  '生まれ変わり': 'reborn',
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
  'TUEEE': 'STRONG',
  '配下': 'subordinate',
  '中二病': 'chunnibyou',
  '一人称': '1st person',
  '鬼畜': 'brute',
  '不器用': 'clumsy',
  'オリジナル': 'original',
  '要素': 'factors',
  // common words
  '番': 'spouse',
  'インスタント': 'instant',
  '腹黒': 'black-hearted',
  '睡眠': 'sleep',
  '多分': 'lots of',
  '過ぎ去りし': 'passing',
  '気味': 'tendency',
  '専属': 'exclusive',
  '時折': 'sometimes',
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
  // '多数': 'lots',
  // theme
  'つまらない': 'tedious',
  'ありきたり': 'common',
  'パロ': 'parody',
  'テンプレ': 'template',
  'シュール': 'surreal',
  'どん底': 'bottom',
  '成り上がり': 'upstart',
  '立ち向かう': 'oppose',
  'ご都合主義': 'opportunism',
  '滅亡回避': 'downfall evasion',
  'ざまぁ': 'serve you right!',
  '料理': 'cooking',
  'お料理': 'cooking',
  'もふもふ': 'mofumofu',
  'モフモフ': 'MOFUMOFU',
  'スローライフ': 'slow life',
  '貧乏': 'poverty',
  'ドタバタ': 'slapstick',
  '勘違い': 'misunderstanding',
  'すれ違い': 'missed meeting',
  '迷宮': 'labyrinth',
  '不老不死': 'perpetual youth',
  'あべこべ': 'inversed',
  'スポーツ': 'sport',
  '部活': 'clubs',
  '最強': 'strongest',
  '最恐': 'scariest',
  '無双': 'peerless',
  '無能力': 'incompetence',
  '記憶喪失': 'amnesia',
  '時間停止': 'time stop',
  '旅': 'travel',
  '旅行': 'journey',
  '不良': 'delinquent',
  '頭脳': 'intelectual',
  '勇者召喚': 'hero summoning',
  // state
  'ゆっくり': 'restful',
  'サクサク': 'quickly',
  'たまに': 'occasionally',
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
  '陰謀': 'conspiracy',
  '人体実験': 'human experiment',
  // cautions
  'グロ': 'GROSTESQUE',
  '注意': 'CAUTION',
  // 'グロ注意': 'GROSTESQUE CAUTION',
  // management
  '村づくり': 'village building',
  '村作り': 'village building',
  '建国': 'kingdom founding',
  '国家運営': 'country management',
  '経済': 'economics',
  '外交': 'diplomacy',
  '戦争': 'war',
  '戦記': 'war chronicle',
  '戦略': 'strategy',
  '戦術': 'tactics',
  '商品売買': 'product trading',
  '生産': 'production',
  '葛藤': 'conflict',
  // location
  '女子高': 'girls\' high school',
  '高校': 'high school',
  '中学': 'middle school',
  '小学': 'grade school',
  '大学': 'college',
  '学校': 'school',
  '日本': 'Japan',
  '魔術学校': 'magic school',
  '魔法学園': 'magic academy',
  '学園都市': 'university town',
  'ゲームの世界': 'game world',
  '現代社会': 'modern society',
  '教会': 'church',
  'ギルド': 'guild',
  '騎士団': 'knight order',
  '冒険者ギルド': 'adventurer guild',
  // system
  'vrmmo': 'VRMMO',
  'アイテムボックス': 'item box',
  'ステータス': 'status',
  'スキル': 'skill',
  'ステータスとスキル': 'status & skill',
  'sssランク': 'SSS-rank',
  'エロゲ': 'ero-game',
  '成長': 'growth',
  '進化': 'evolution',
  '変化': 'mutation',
  // objects
  '攻略本': 'strategy guide',
  'エクスカリバー': 'Excalibur',
  'チート商品': 'cheat items',
  '武器': 'weapon',
  '防具': 'armor',
  '魔剣': 'magic sword',
  '聖剣': 'holy sword',
  '銃': 'gun',
  '飛行船': 'airship',
  'カクテル': 'cocktail',
  // combat & abilities
  'バトル': 'battle',
  '盾': 'shield',
  '剣': 'sword',
  '魔力': 'magic power',
  '物理攻撃': 'physical attack',
  '魔法攻撃': 'magical attack',
  '回復': 'recovery',
  // '魔法': 'magic',
  '剣と魔法': 'sword & magic',
  '剣士': 'swordman',
  '魔導': 'sorcery',
  '魔術': 'wizardry',
  '剣術': 'swordmanship',
  '死魔法': 'necromancy',
  '武術': 'martial art',
  '陰陽師': 'onmyouji',
  '陰陽道': 'yin & yang',
  '式神': 'shikigami',
  '格闘技': 'unarmed combat',
  '召喚士': 'summoner',
  '召喚': 'summon',
  '希少職': 'rare job',
  '錬金術師': 'alchemist',
  '鍛冶': 'smithing',
  '鍛冶師': 'blacksmith',
  '料理人': 'chef',
  '催眠': 'hypnosis',
  '洗脳': 'brainwash',
  // species
  'モンスター': 'MONSTER',
  'スライム': 'SLIME',
  'ドラゴン': 'DRAGON',
  'オーク': 'ORC',
  'ゴブリン': 'GOBLIN',
  'サキュバス': 'SUCCUBUS',
  'ゴーレム': 'GOLEM',
  'ゾンビ': 'ZOMBIE',
  'ネクロマンサー': 'NECROMANCER',
  '獣': 'animal',
  '悪魔': 'devil',
  '魔物': 'magical being',
  '魔獣': 'magic beast',
  '妖怪': 'youkai',
  '天狗': 'tengu',
  '精霊': 'spirit',
  '幽霊': 'spectre',
  '吸血鬼': 'vampire',
  '獣人': 'beastfolk',
  '人狼': 'werewolf',
  'ドワーフ': 'DWARF',
  'エルフ': 'ELF',
  'ダークエルフ': 'DARK ELF',
  '人造人間': 'artificial human',
  '魔族': 'demonfolk',
  '亜人': 'demi-human',
  // characters: male
  'おっさん': 'ossan',
  'ヒモ': 'gigolo',
  '王': 'king',
  '王様': 'king',
  '王子': 'prince',
  '執事': 'butler',
  // characters: neutral
  'マスター': 'MASTER',
  'ゲーマー': 'GAMER',
  'バーサーカー': 'BERSERKER',
  '脇役': 'supporting role',
  '神': 'god',
  '転生者': 'reincarnator',
  '暗殺者': 'assassin',
  '公爵': 'duke',
  '伯爵': 'count',
  '貴族': 'noble',
  '騎士': 'knight',
  '冒険者': 'adventurer',
  'Sランク冒険者': 'S-rank adventurer',
  '奴隷': 'slave',
  '英雄': 'hero',
  '教師': 'teacher',
  '先生': 'sensei',
  '高校生': 'high-schooler',
  '中学生': 'middle-schooler',
  '小学生': 'grade-schooler',
  '大学生': 'college student',
  '魔法使い': 'magician',
  '魔導師': 'sorcerer',
  '最強魔導士': 'strongest sorcerer',
  'テイマー': 'tamer',
  '従魔': 'tamed creatures',
  '賢者': 'sage',
  '剣聖': 'sword saint',
  '大隊長': 'battalion commander',
  '幼馴染': 'childhood friend',
  // characters: female
  'ヒロイン': 'heroine',
  '女神': 'goddess',
  '女神さま': 'goddess',
  '天使': 'angel',
  '聖女': 'saintess',
  '姫': 'hime',
  '女王': 'queen',
  '王女': 'princess',
  '女公爵': 'duchess',
  '令嬢': 'young lady',
  'お嬢様': 'ojou-sama',
  '女騎士': 'female knight',
  '魔女': 'witch',
  '魔法少女': 'magical girl',
  '獣娘': 'beast girl',
  'メイド': 'maid',
  '侍女': 'lady attendant',
  '女教師': 'female teacher',
  '女子大学生': 'college girl',
  '女子高生': 'high-school girl',
  '女子中学生': 'middle-school girl',
  '女子小学生': 'grade-school girl',
  'モデル': 'model',
  '少年': 'boy',
  '少女': 'girl',
  '幼女': 'little girl',
  '女性': 'woman',
  '美少女': 'beautiful girl',
  '合法ロリ': 'legal loli',
  'モン娘': 'monster girl',
  '獣耳': 'animal ears',
  '猫耳娘': 'cat ears girl',
  'ギャル': 'gyaru',
  'ビッチ': 'bitch',
  // characters: relations
  'パパ': 'papa',
  'ママ': 'mama',
  '父': 'father',
  '父さん': 'father',
  'お父さん': 'father',
  '母': 'mother',
  '母さん': 'mother',
  'お母さん': 'mother',
  '母親': 'mother',
  '娘': 'girl',
  '娘さん': 'daughter',
  'お娘さん': 'daughter',
  '母娘': 'mother and daughter',
  '母息子': 'mother and son',
  '息子': 'son',
  '息子さん': 'son',
  '兄妹': 'older brother and younger sister',
  '姉': 'big sister',
  '姉さん': 'big sister',
  'お姉さん': 'big sister',
  '姉弟': 'big sister and little brother',
  '妹': 'younger sister',
  '妹さん': 'younger sister',
  'お妹さん': 'younger sister',
  '兄弟': 'brothers',
  '姉妹': 'sisters',
  '姪': 'niece',
  '姪っ子': 'niece',
  '嫁': 'wife',
  '嫁さん': 'wife',
  'お嫁さん': 'wife',
  '義妹': 'sister-in-law',
  '義兄弟': 'brother-in-law',
  '少年少女': 'boys & girls',
  '男女比': 'gender ratio',
  '男女': 'men & women',
  '主従': 'master & servant',
  '後輩': 'kouhai',
  '先輩': 'senpai',
  // friendship
  '友情': 'friendship',
  // love: romance
  '一途': 'wholehearted',
  '恋': 'love',
  '純愛': 'pure love',
  'イチャイチャ': 'flirting',
  'いちゃいちゃ': 'flirting',
  'イチャラブ': 'flirty',
  'いちゃラブ': 'flirty',
  '三角関係': 'love triangle',
  '禁断の恋': 'forbidden love',
  '溺愛': 'blind love',
  '嫉妬': 'envy',
  '百合': 'yuri',
  'レズ': 'lez',
  'ガールズラブ': 'girls love',
  'ボーイズラブ': 'boys love',
  'オメガバース': 'Omegaverse',
  'gl': 'GL',
  'bl': 'BL',
  'sm': 'SM',
  '婚約': 'engagement',
  '婚約破棄': 'engagement discarded',
  '運命': 'destiny',
  '婚活': 'marriage hunting',
  '結婚': 'marriage',
  'ツンデレ': 'tsundere',
  'ヤンデレ': 'yandere',
  '鈍感主人公': 'thickheaded protagonist',
  '学園コメディ': 'school comedy',
  'ブラコン': 'brocon',
  'シスコン': 'siscon',
  'マザコン': 'mothercon',
  'らぶらぶ': 'lovey-dovey',
  'ラブラブ': 'lovey-dovey',
  '女性視点': 'girl POV',
  '男性視点': 'boy POV',
  'ショタ': 'shota',
  'おねショタ': 'onee-shota',
  // characteristics
  '可愛い': 'cute',
  '年上': 'older',
  '年下': 'younger',
  '絶倫': 'peerless vigor',
  '変態': 'pervert',
  '執着': 'obsession',
  '羞恥': 'shyness',
  '美形': 'beauty',
  '美人': 'beauty',
  '平凡': 'average',
  '巨乳': 'big boobs',
  '爆乳': 'explosive boobs',
  '貧乳': 'tiny breasts',
  '巨根': 'big dick',
  '体格差': 'physique difference',
  'ロリ': 'loli',
  'エロ': 'ero',
  'エロコメ': 'ero comedy',
  '甘々': 'sugary',
  'あまあま': 'sugary',
  'ふたなり': 'futanari',
  '性奴隷': 'sex slave',
  '雌奴隷': 'female slave',
  '肉便器': 'meat toilet',
  '人妻': 'married woman',
  '熟女': 'mature lady',
  '処女': 'virgin',
  '非処女': 'non-virgin',
  '童貞': 'virgin♂',
  '貞操': 'chasity',
  '母乳': 'mother milk',
  // sexual
  'tsf': 'TSF',
  'ts': 'TS',
  'オナニー': 'masturbation',
  '強制': 'coered',
  'リョナ': 'ryona',
  'レイプ': 'rape',
  '輪姦': 'gang rape',
  '痴漢': 'molest',
  '露出': 'exposure',
  'お尻': 'butt',
  'アナル': 'anal',
  '緊縛': 'bondage',
  'お仕置き': 'punishment',
  '躾': 'discipline',
  '開発': 'development',
  '寝取り': 'netori',
  '寝取らせ': 'let cuckolding',
  '寝取られ': 'cuckolding',
  'ネトラレ': 'cuckolding',
  '拘束': 'restraint',
  '監禁': 'confinement',
  '和姦': 'intercourse',
  'フェラチオ': 'fellatio',
  'パイズリ': 'titty fuck',
  '中出し': 'creampie',
  '孕ませ': 'impregnate',
  '妊活': 'conceive',
  '妊娠': 'pregnancy',
  '出産': 'childbirth',
  '調教': 'break-in',
  '近親相姦': 'incest',
  '性転換': 'sex change',
  '媚薬': 'aphrodisiac',
  '凌辱': 'disgrace',
  '陵辱': 'assault',
  '強姦': 'violate',
  '快楽堕ち': 'fall in pleasure',
  'らぶえっち': 'lovers echi',
  'じれじれ': 'teasing',
  '淫語': 'dirty talk',
  '淫紋': 'lewd clothes',
  '触手': 'tentacle',
  'ボテ腹': 'pregnant belly',
  '精液ボテ': 'semen belly',
  '精液': 'semen',
  '生ハメ': 'raw fuck',
  // love: family
  '親馬鹿': 'doting parent',
  '家族愛': 'family love',
  // website
  'ovl大賞5': 'OVL Prize 5',
  'アイリス大賞４': 'Iris Prize 4',
  'esn大賞': 'ESN Prize',
  'ネット小説大賞七': 'Webnovel Prize 7',
  '感想': 'impressions',
  '初投稿': 'first contribution',
  // (quotes)
  '（予定）': '(planned)',
  '（笑）': '(LOL)',
  // others
  '音楽': 'music',
  'お花畑': 'flower field',
  '植物学': 'botany',
  '地質学': 'geology',
  'ライトノベル': 'light novel',
  'コミカライズ': 'comic adaptation',
  '電子書籍': 'ebook',
  '電子書籍化': 'ebook adaptation',
  '書籍化': 'book adaptation',
  '短編集': 'short stories collection',
  '豆知識': 'trivia'
}

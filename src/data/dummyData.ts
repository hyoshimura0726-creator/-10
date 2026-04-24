import { Recipe } from '../types';

export const DUMMY_RECIPES: Recipe[] = [
  {
    id: '1',
    title: '我が家の至高の肉じゃが',
    imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=800&auto=format&fit=crop', // A somewhat generic stew/meat dish image
    category: '主菜',
    tags: ['和食', '煮物', '家庭料理'],
    ingredients: [
      { id: 'i1', name: '牛薄切り肉', amount: '200g' },
      { id: 'i2', name: 'じゃがいも', amount: '3個' },
      { id: 'i3', name: '玉ねぎ', amount: '1個' },
      { id: 'i4', name: 'にんじん', amount: '1/2本' },
      { id: 'i5', name: 'しらたき', amount: '1袋' },
      { id: 'i6', name: '醤油', amount: '大さじ3' },
      { id: 'i7', name: 'みりん', amount: '大さじ3' },
      { id: 'i8', name: '砂糖', amount: '大さじ2' },
      { id: 'i9', name: '酒', amount: '大さじ2' },
      { id: 'i10', name: '水', amount: '200ml' },
    ],
    steps: [
      { id: 's1', description: 'じゃがいもは皮を剥いて一口大に切り、水にさらす。にんじんは乱切りに、玉ねぎはくし切りにする。' },
      { id: 's2', description: 'しらたきは下茹でして食べやすい長さに切る。牛肉も大きい場合は切っておく。' },
      { id: 's3', description: '鍋にサラダ油（分量外）を熱し、牛肉を炒める。色が変わったら玉ねぎ、にんじん、じゃがいも、しらたきの順に加えて炒め合わせる。' },
      { id: 's4', description: '水と酒を加え、沸騰したらアクを取る。砂糖、みりんを加えて落とし蓋をし、中火で7〜8分煮る。' },
      { id: 's5', description: '醤油を加え、さらに落とし蓋をして弱〜中火で15分ほど、煮汁が少なくなるまで煮込む。そのまま冷まして味を染み込ませる。' },
    ],
    tips: '【黄金比】醤油：みりん：砂糖：酒 ＝ 3：3：2：2\n\n一度完全に冷ますことで、じゃがいもの中までしっかり味が染み込みます。次の日が一番美味しい！',
    isTipsPublic: true,
    nutrition: { calories: 380, protein: 18, carbs: 36, fat: 16 },
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: '2',
    title: 'ふわふわパンケーキ',
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop',
    category: 'スイーツ',
    tags: ['おやつ', '休日', '簡単'],
    ingredients: [
      { id: 'i11', name: '薄力粉', amount: '150g' },
      { id: 'i12', name: 'ベーキングパウダー', amount: '小さじ2' },
      { id: 'i13', name: '卵', amount: '2個' },
      { id: 'i14', name: '牛乳', amount: '120ml' },
      { id: 'i15', name: '砂糖', amount: '大さじ3' },
      { id: 'i16', name: 'ヨーグルト', amount: '大さじ2' },
    ],
    steps: [
      { id: 's6', description: '卵は卵黄と卵白に分ける。薄力粉とベーキングパウダーは合わせてふるっておく。' },
      { id: 's7', description: '卵黄のボウルに牛乳、ヨーグルトを加えてよく混ぜる。粉類を加えてさっくりと混ぜ合わせる。' },
      { id: 's8', description: '別のボウルで卵白を泡立てる。途中で砂糖を2〜3回に分けて加え、しっかりとしたメレンゲを作る。' },
      { id: 's9', description: 'メレンゲの1/3を卵黄の生地に加えてなじませたら、残りのメレンゲも加え、泡を潰さないように優しく混ぜる。' },
      { id: 's10', description: 'フライパンを弱火で熱し、生地を高くこんもりと落とす。蓋をして3分焼き、裏返してさらに2〜3分焼く。' },
    ],
    tips: 'ヨーグルトを少し加えることで、ふんわり＆もっちり感がアップします！メレンゲは角が立つまでしっかり泡立てるのが最大のコツです。',
    isTipsPublic: true,
    nutrition: { calories: 420, protein: 12, carbs: 65, fat: 14 },
    createdAt: Date.now() - 86400000,
  }
];

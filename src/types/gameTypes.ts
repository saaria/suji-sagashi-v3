// 難易度の型定義
export type Difficulty = 'Easy' | 'Normal' | 'Hard' | 'Hell';

// 難易度ごとのCPU待機時間設定（秒）
export const DIFFICULTY_SETTINGS: Record<Difficulty, number> = {
  Easy: 4,
  Normal: 3,
  Hard: 2,
  Hell: 1
};

// ステータスバッジタイプを追加
export type StatusBadge = 'CPUget' | 'Shorten' | 'Question' | 'Unknown' | 'Shuffle';

// すべてのバッジタイプを統合
export type BadgeType = Difficulty | StatusBadge; 
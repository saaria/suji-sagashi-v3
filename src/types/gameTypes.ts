// 難易度の型定義
export type Difficulty = 'Easy' | 'Normal' | 'Hard' | 'Hell';

// 難易度ごとのCPU待機時間設定（秒）
export const DIFFICULTY_SETTINGS: Record<Difficulty, number> = {
  Easy: 4,
  Normal: 3,
  Hard: 2,
  Hell: 1
};

export const SHORTEN_DIFFICULTY_SETTINGS: Record<Difficulty, number> = {
  Easy: 3.5,
  Normal: 2.5,
  Hard: 1.5,
  Hell: 0.75
};

export const EXTEND_CPU_WAIT_SECONDS = 4;

// 難易度ごとのクリアポイント設定
export const CLEAR_POINT: Record<Difficulty, number> = {
  Easy: 20,
  Normal: 23,
  Hard: 27,
  Hell: 32
};

// トリガー発動ターン数の定義
export const QUICKEN_TRIGGER_TURN = 16;
export const SHORTEN_TRIGGER_TURN = 21;
export const SHUFFLE_TRIGGER_TURN = 26;
export const NUM_DOUBLE_TRIGGER_TURN = 31;
export const SECRET_TRIGGER_TURN = 35;
export const HIDING_TRIGGER_TURN = 33;
export const EXTEND_TRIGGER_TURN = 5;

// ステータスバッジタイプを追加
export type StatusBadge =
  | 'CPUget'
  | 'Shorten'
  | 'Quicken'
  | 'Shuffle'
  | 'Num*2'
  | 'Hiding'
  | 'Secret'
  | 'Extend';

// すべてのバッジタイプを統合
export type BadgeType = Difficulty | StatusBadge; 

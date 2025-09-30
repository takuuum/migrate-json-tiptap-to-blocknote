# Migrate Editor Server

SupabaseとNode.jsを使用したマイグレーションエディター用のAPIサンプル

サーバーサイドでBlocknoteを実装する際は、Node.jsサーバーを使用する必要があるため（Next.jsのAPI Routesは動作しない）、純粋なNode.jsサーバーで作成

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. 環境変数の設定:
```bash
cp .env.example .env
```

`.env`ファイルを編集して、Supabaseの設定を追加してください:
- `SUPABASE_URL`: SupabaseプロジェクトのURL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー
- `PORT`: サーバーのポート番号 (デフォルト: 3001)

## 使用方法

開発モードで開始:
```bash
npm run dev
```

本番モードで開始:
```bash
npm start
```

## API エンドポイント

- `GET /health` - サーバーのヘルスチェック
- `GET /api/test-db` - データベース接続テスト
- `POST /api/migrate/:workId` - Tiptap→Blocknoteのデータ移行

## 構造

- `server.js` - メインサーバーファイル
- `config/supabase.js` - Supabase設定
- `package.json` - プロジェクト設定

## 参考
- [How to Convert Tiptap JSON to Blocknote JSON · Issue #1961 · TypeCellOS/BlockNote](https://github.com/TypeCellOS/BlockNote/issues/1961)
- [Investigate server-util package usage for Next.js SSR and other environments · Issue #942 · TypeCell](https://github.com/TypeCellOS/BlockNote/issues/942)

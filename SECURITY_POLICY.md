# Local-Only / Confidential Data Security Policy

## Priority

このポリシーを機能要件より優先する。

## Confidential data

顧客データ、売上データ、商品データ、商品単価、仕入データ、ツケ、未収金額などを機密として扱う。PII、財務情報、取引情報を含む可能性がある前提で処理する。

## Default deny

- Data Egress: deny
- Cloud Processing: deny
- Remote Inference: deny for real data
- External AI API: deny for real data
- External Embedding API: deny
- Cloud Sync: deny
- Telemetry / Analytics: disabled
- Crash report with payload data: disabled
- Browser / Web Search / Connector / MCPへの実データ送信: deny

## Local processing

- Local Filesystem only
- Local SQLite / CSV / JSON / Excel
- Local OCR
- Local Embedding
- Local RAG / Local Vector DB
- Local LLM preferred
- Temporary files, cache, logs, artifacts, checkpoints and backups are local only

## Data minimization

- 不要な列を読み込まない
- 不要なPIIを保持しない
- 元データはRead-Onlyを基本とする
- 加工データは別ファイルにする
- 元データの上書き・削除は行わない

## External communication

外部通信が必要になった場合は処理を停止し、送信先、送信対象、目的、必要理由を明示する。明示許可があるまで実行しない。

## Public preview

GitHub Pages等の公開プレビュー環境は実データ処理に使用しない。サンプル・ダミーデータのみを扱う。

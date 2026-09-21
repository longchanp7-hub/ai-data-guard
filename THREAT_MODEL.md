# Threat Model v0

## 保護対象

- 顧客情報 / PII
- 売上、単価、仕入、未収、ツケ等の財務・取引情報
- 匿名化対応表
- 一時ファイル / キャッシュ / ログ
- ローカルRAG / Vector DB / Embedding

## 主な脅威

1. クラウドAIへ実データを誤送信
2. Telemetry / Analytics / Crash Reportによる漏えい
3. Cloud Syncによる複製
4. ブラウザ拡張や外部スクリプトへの露出
5. ログへの機密値残存
6. Git commitへの実データ混入
7. 外部検索クエリへの顧客情報混入

## 初期対策

- Preview環境では実データ入力機能そのものを実装しない
- 外部JS / CDN / Analyticsを使用しない
- CSPで connect-src none
- 外部送信機能はDefault Deny
- 本番版はローカル配布アプリとしてPreviewと分離
- GitHubにはコードとダミーデータのみ

/**
 * パフォーマンステスト - 大量アイテム（100+件）での動作確認
 *
 * このスクリプトは以下をテストします:
 * - 100件のTODOアイテムの作成
 * - LocalStorageへの保存速度
 * - LocalStorageからの読み込み速度
 * - メモリ使用量の確認
 */

import { TodoService } from './services/TodoService'
import { TodoRepository } from './repositories/TodoRepository'

const repository = new TodoRepository()
const todoService = new TodoService(repository)

// パフォーマンステスト実行
export function runPerformanceTest() {
  console.log('=== パフォーマンステスト開始 ===\n')

  // テスト1: 大量アイテムの作成
  console.log('テスト1: 150件のTODOアイテムを作成...')
  const createStartTime = performance.now()

  for (let i = 1; i <= 150; i++) {
    const result = todoService.createTodo(`TODOアイテム ${i}`)
    if (!result.success) {
      console.error(`作成失敗: ${i}件目`, result.error)
      return
    }
  }

  const createEndTime = performance.now()
  const createDuration = createEndTime - createStartTime
  console.log(`✓ 150件作成完了: ${createDuration.toFixed(2)}ms (平均: ${(createDuration / 150).toFixed(2)}ms/件)\n`)

  // テスト2: LocalStorageからの読み込み速度
  console.log('テスト2: LocalStorageからの読み込み速度測定...')
  const loadStartTime = performance.now()

  const loadResult = todoService.loadTodos()
  if (!loadResult.success) {
    console.error('読み込み失敗', loadResult.error)
    return
  }

  const loadEndTime = performance.now()
  const loadDuration = loadEndTime - loadStartTime
  console.log(`✓ 読み込み完了: ${loadDuration.toFixed(2)}ms\n`)

  // テスト3: 全アイテムの取得
  console.log('テスト3: 全アイテムの取得速度測定...')
  const getAllStartTime = performance.now()

  const allTodos = todoService.getAllTodos()

  const getAllEndTime = performance.now()
  const getAllDuration = getAllEndTime - getAllStartTime
  console.log(`✓ ${allTodos.length}件取得完了: ${getAllDuration.toFixed(2)}ms\n`)

  // テスト4: ランダムアイテムの完了切り替え（10回）
  console.log('テスト4: ランダムアイテムの完了切り替え（10回）...')
  const toggleStartTime = performance.now()

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * allTodos.length)
    const randomTodo = allTodos[randomIndex]
    const result = todoService.toggleTodo(randomTodo.id)
    if (!result.success) {
      console.error(`切り替え失敗: ${i + 1}回目`, result.error)
      return
    }
  }

  const toggleEndTime = performance.now()
  const toggleDuration = toggleEndTime - toggleStartTime
  console.log(`✓ 10回の切り替え完了: ${toggleDuration.toFixed(2)}ms (平均: ${(toggleDuration / 10).toFixed(2)}ms/回)\n`)

  // テスト5: ランダムアイテムの削除（10件）
  console.log('テスト5: ランダムアイテムの削除（10件）...')
  const deleteStartTime = performance.now()

  for (let i = 0; i < 10; i++) {
    const currentTodos = todoService.getAllTodos()
    if (currentTodos.length === 0) break

    const randomIndex = Math.floor(Math.random() * currentTodos.length)
    const randomTodo = currentTodos[randomIndex]
    const result = todoService.deleteTodo(randomTodo.id)
    if (!result.success) {
      console.error(`削除失敗: ${i + 1}件目`, result.error)
      return
    }
  }

  const deleteEndTime = performance.now()
  const deleteDuration = deleteEndTime - deleteStartTime
  const remainingCount = todoService.getAllTodos().length
  console.log(`✓ 10件削除完了: ${deleteDuration.toFixed(2)}ms (残り: ${remainingCount}件)\n`)

  // テスト6: LocalStorageサイズの確認
  console.log('テスト6: LocalStorageサイズの確認...')
  const storageData = localStorage.getItem('todos')
  if (storageData) {
    const sizeInBytes = new Blob([storageData]).size
    const sizeInKB = (sizeInBytes / 1024).toFixed(2)
    console.log(`✓ LocalStorageサイズ: ${sizeInKB} KB (${sizeInBytes} bytes)\n`)
  }

  // サマリー
  console.log('=== パフォーマンステスト完了 ===')
  console.log('総合結果:')
  console.log(`- 150件作成: ${createDuration.toFixed(2)}ms`)
  console.log(`- データ読み込み: ${loadDuration.toFixed(2)}ms`)
  console.log(`- 全件取得: ${getAllDuration.toFixed(2)}ms`)
  console.log(`- 10回切り替え: ${toggleDuration.toFixed(2)}ms`)
  console.log(`- 10件削除: ${deleteDuration.toFixed(2)}ms`)
  console.log(`\n✓ すべてのパフォーマンステストが正常に完了しました`)

  // クリーンアップ
  repository.clearTodos()
  console.log('\n✓ テストデータをクリアしました')
}

// ブラウザ環境での実行用
if (typeof window !== 'undefined') {
  (window as any).runPerformanceTest = runPerformanceTest
}

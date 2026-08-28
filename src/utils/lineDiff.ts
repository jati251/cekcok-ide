export interface LineChange {
  startLine: number
  endLine: number
  type: 'added' | 'modified' | 'deleted'
}

function getStringSimilarity(a: string, b: string): number {
  if (a === b) return 1
  if (!a || !b) return 0
  const aTrim = a.trim()
  const bTrim = b.trim()
  if (aTrim === bTrim) return 0.95

  const bigramsA = new Set<string>()
  for (let i = 0; i < aTrim.length - 1; i++) bigramsA.add(aTrim.substring(i, i + 2))
  let intersection = 0
  for (let i = 0; i < bTrim.length - 1; i++) {
    if (bigramsA.has(bTrim.substring(i, i + 2))) intersection++
  }
  return (2 * intersection) / (aTrim.length + bTrim.length + 1)
}

/**
 * Computes line-level differences between original baseline and current modified text.
 */
export function computeLineDiff(originalText: string, modifiedText: string): LineChange[] {
  if (originalText === modifiedText) return []
  if (!originalText && !modifiedText) return []

  const originalLines = originalText.split(/\r?\n/)
  const modifiedLines = modifiedText.split(/\r?\n/)

  if (!originalText) {
    return [
      {
        startLine: 1,
        endLine: Math.max(1, modifiedLines.length),
        type: 'added',
      },
    ]
  }

  if (!modifiedText) {
    return [
      {
        startLine: 1,
        endLine: 1,
        type: 'deleted',
      },
    ]
  }

  // Fast prefix / suffix matching optimization
  let prefix = 0
  while (
    prefix < originalLines.length &&
    prefix < modifiedLines.length &&
    originalLines[prefix] === modifiedLines[prefix]
  ) {
    prefix++
  }

  let origSuffix = originalLines.length - 1
  let modSuffix = modifiedLines.length - 1

  while (
    origSuffix >= prefix &&
    modSuffix >= prefix &&
    originalLines[origSuffix] === modifiedLines[modSuffix]
  ) {
    origSuffix--
    modSuffix--
  }

  const trimmedOrig = originalLines.slice(prefix, origSuffix + 1)
  const trimmedMod = modifiedLines.slice(prefix, modSuffix + 1)

  const n = trimmedOrig.length
  const m = trimmedMod.length

  if (n === 0 && m > 0) {
    return [
      {
        startLine: prefix + 1,
        endLine: prefix + m,
        type: 'added',
      },
    ]
  }

  if (m === 0 && n > 0) {
    return [
      {
        startLine: Math.max(1, prefix + 1),
        endLine: Math.max(1, prefix + 1),
        type: 'deleted',
      },
    ]
  }

  // LCS Dynamic Programming on trimmed center
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (trimmedOrig[i - 1] === trimmedMod[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to extract diff chunks
  let i = n
  let j = m
  const rawChanges: Array<{ type: 'add' | 'del' | 'eq'; origIdx: number; modIdx: number }> = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && trimmedOrig[i - 1] === trimmedMod[j - 1]) {
      rawChanges.unshift({ type: 'eq', origIdx: prefix + i, modIdx: prefix + j })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawChanges.unshift({ type: 'add', origIdx: prefix + i, modIdx: prefix + j })
      j--
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawChanges.unshift({ type: 'del', origIdx: prefix + i, modIdx: prefix + j })
      i--
    }
  }

  // Group additions/deletions and cleanly separate added vs modified
  const changes: LineChange[] = []
  let k = 0

  while (k < rawChanges.length) {
    if (rawChanges[k].type === 'eq') {
      k++
      continue
    }

    const delChunk: number[] = []
    const addChunk: number[] = []

    while (k < rawChanges.length && rawChanges[k].type !== 'eq') {
      if (rawChanges[k].type === 'del') {
        delChunk.push(rawChanges[k].origIdx)
      } else if (rawChanges[k].type === 'add') {
        addChunk.push(rawChanges[k].modIdx)
      }
      k++
    }

    const delCount = delChunk.length
    const addCount = addChunk.length

    if (delCount === 0 && addCount > 0) {
      // Pure addition
      changes.push({
        startLine: addChunk[0],
        endLine: addChunk[addChunk.length - 1],
        type: 'added',
      })
    } else if (addCount === 0 && delCount > 0) {
      // Pure deletion
      const anchorLine = k < rawChanges.length && rawChanges[k].modIdx ? rawChanges[k].modIdx : (addChunk[0] || prefix + 1)
      changes.push({
        startLine: Math.max(1, anchorLine),
        endLine: Math.max(1, anchorLine),
        type: 'deleted',
      })
    } else if (delCount > 0 && addCount > 0) {
      if (delCount === addCount) {
        // Direct 1-to-1 modification
        changes.push({
          startLine: addChunk[0],
          endLine: addChunk[addChunk.length - 1],
          type: 'modified',
        })
      } else if (addCount > delCount) {
        // More additions than deletions: determine which lines are modified vs newly added
        // Check if deleted lines match better with the end or the beginning of added lines
        const topScore = delChunk.reduce((acc, origIdx, idx) => {
          const modIdx = addChunk[idx]
          return acc + getStringSimilarity(originalLines[origIdx - 1] || '', modifiedLines[modIdx - 1] || '')
        }, 0) / delCount

        const bottomScore = delChunk.reduce((acc, origIdx, idx) => {
          const modIdx = addChunk[addCount - delCount + idx]
          return acc + getStringSimilarity(originalLines[origIdx - 1] || '', modifiedLines[modIdx - 1] || '')
        }, 0) / delCount

        if (bottomScore > topScore && bottomScore > 0.3) {
          // Top lines are purely NEW added lines, bottom lines are MODIFIED lines
          const addedLinesCount = addCount - delCount
          changes.push({
            startLine: addChunk[0],
            endLine: addChunk[addedLinesCount - 1],
            type: 'added',
          })
          changes.push({
            startLine: addChunk[addedLinesCount],
            endLine: addChunk[addCount - 1],
            type: 'modified',
          })
        } else {
          // Top lines are MODIFIED lines, bottom lines are NEW added lines
          changes.push({
            startLine: addChunk[0],
            endLine: addChunk[delCount - 1],
            type: 'modified',
          })
          changes.push({
            startLine: addChunk[delCount],
            endLine: addChunk[addCount - 1],
            type: 'added',
          })
        }
      } else {
        // More deletions than additions (e.g. replaced 3 lines with 1 line)
        changes.push({
          startLine: addChunk[0],
          endLine: addChunk[addCount - 1],
          type: 'modified',
        })
      }
    }
  }

  return changes
}

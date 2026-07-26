export function calculateCalibration(predictions = []) {
  if (!predictions.length) return { score: 0, samples: 0 };
  const error = predictions.reduce((sum, item) => {
    const predicted = Math.max(0, Math.min(1, Number(item.confidence || 0)));
    const actual = item.correct ? 1 : 0;
    return sum + Math.abs(predicted - actual);
  }, 0) / predictions.length;
  return {
    score: Math.round((1 - error) * 100),
    samples: predictions.length,
    meanAbsoluteError: Number(error.toFixed(4)),
  };
}

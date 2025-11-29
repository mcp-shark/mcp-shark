import { colors } from '../../theme';

export function getRiskLevelColor(riskLevel) {
  if (!riskLevel) return colors.textTertiary;
  switch (riskLevel.toLowerCase()) {
    case 'none':
      return colors.accentGreen;
    case 'low':
      return colors.accentBlue;
    case 'medium':
      return colors.accentOrange;
    case 'high':
      return colors.error;
    case 'critical':
      return colors.error;
    default:
      return colors.textTertiary;
  }
}

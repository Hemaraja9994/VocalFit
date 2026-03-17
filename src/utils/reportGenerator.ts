/**
 * PDF Report Generator for VocalFit
 *
 * Generates an HTML report string that can be printed to PDF
 * using expo-print + expo-sharing on device.
 *
 * This approach works cross-platform (iOS + Android) without
 * needing native PDF libraries.
 */

import { AssessmentSession, UserProfile, VFIResults } from '../types';
import { getRatingLabel, getRatingColor, GRBAS_SCALE_LABELS } from '../data/normativeData';
import { rateVFI } from '../data/vfiItems';

interface ReportData {
  user: UserProfile;
  session: AssessmentSession;
  vfi?: VFIResults;
}

export function generateReportHTML(data: ReportData): string {
  const { user, session, vfi } = data;
  const date = new Date(session.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const a = session.aerodynamic;
  const ac = session.acoustic;
  const p = session.perceptual;
  const v = session.vhi;

  const scoreColor = session.vocalFitnessScore >= 80 ? '#A4D65E'
    : session.vocalFitnessScore >= 60 ? '#FBBF24'
    : session.vocalFitnessScore >= 40 ? '#F97316' : '#EF4444';

  const scoreLabel = session.vocalFitnessScore >= 80 ? 'Excellent'
    : session.vocalFitnessScore >= 60 ? 'Good'
    : session.vocalFitnessScore >= 40 ? 'Fair' : 'Needs Attention';

  const ratingBadge = (rating: string) => {
    const c = getRatingColor(rating as any);
    return `<span style="background:${c}20;color:${c};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">${getRatingLabel(rating as any)}</span>`;
  };

  const grbasBar = (label: string, val: number) => {
    const pct = (val / 3) * 100;
    const c = val === 0 ? '#A4D65E' : val === 1 ? '#FBBF24' : val === 2 ? '#F97316' : '#EF4444';
    return `
      <tr>
        <td style="width:100px;font-weight:500;">${label}</td>
        <td><div style="background:#F3F4F6;height:8px;border-radius:4px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:${c};border-radius:4px;"></div></div></td>
        <td style="width:50px;text-align:right;color:${c};font-weight:600;">${val}/3</td>
        <td style="width:70px;font-size:11px;color:#9CA3AF;">${GRBAS_SCALE_LABELS[val]}</td>
      </tr>`;
  };

  let vfiSection = '';
  if (vfi) {
    const burden = vfi.fatigue + vfi.physicalDiscomfort;
    const severity = rateVFI(vfi.fatigue, vfi.physicalDiscomfort);
    vfiSection = `
      <h2>Vocal Fatigue Index</h2>
      <table class="data-table">
        <tr><td>Tiredness &amp; avoidance (Factor 1)</td><td style="text-align:right;font-weight:600;color:#EF6C00;">${vfi.fatigue}/44</td></tr>
        <tr><td>Physical discomfort (Factor 2)</td><td style="text-align:right;font-weight:600;color:#E53935;">${vfi.physicalDiscomfort}/36</td></tr>
        <tr><td>Recovery with rest (Factor 3)</td><td style="text-align:right;font-weight:600;color:#43A047;">${vfi.restRecovery}/36</td></tr>
        <tr style="border-top:2px solid #E5E7EB;"><td style="font-weight:700;">Fatigue burden</td><td style="text-align:right;font-weight:700;color:#EF6C00;">${burden}/80 — ${severity}</td></tr>
      </table>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Helvetica Neue', sans-serif; color: #1A1A1A; padding: 40px; font-size: 14px; line-height: 1.6; }
  h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
  h2 { font-size: 16px; font-weight: 600; color: #374151; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #A4D65E; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
  .header-left h1 { color: #A4D65E; }
  .header-left p { color: #6B7280; font-size: 13px; }
  .header-right { text-align: right; }
  .patient-info { background: #F9F9F9; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
  .patient-info table td { padding: 3px 12px 3px 0; font-size: 13px; }
  .patient-info table td:first-child { color: #9CA3AF; width: 140px; }
  .score-hero { background: ${scoreColor}; color: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center; }
  .score-hero .score { font-size: 56px; font-weight: 700; }
  .score-hero .score-label { font-size: 18px; opacity: 0.9; }
  .score-hero .score-sub { font-size: 13px; opacity: 0.7; }
  .data-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  .data-table td { padding: 8px 0; border-bottom: 1px solid #F3F4F6; }
  .data-table td:first-child { color: #374151; }
  .grbas-table { width: 100%; border-collapse: collapse; }
  .grbas-table td { padding: 6px 8px; vertical-align: middle; }
  .two-col { display: flex; gap: 16px; }
  .two-col > div { flex: 1; background: #F9F9F9; border-radius: 12px; padding: 14px; text-align: center; }
  .two-col .val { font-size: 22px; font-weight: 700; }
  .two-col .lbl { font-size: 11px; color: #9CA3AF; margin-top: 2px; }
  .disclaimer { background: #F9F9F9; border-radius: 8px; padding: 12px; margin-top: 24px; font-size: 10px; color: #9CA3AF; line-height: 1.5; }
  .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #D1D5DB; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <h1>VocalFit</h1>
    <p>Vocal Health Report</p>
  </div>
  <div class="header-right">
    <p style="font-weight:600;">${date}</p>
    <p style="color:#9CA3AF;font-size:12px;">Report ID: ${session.id}</p>
  </div>
</div>

<div class="patient-info">
  <table>
    <tr><td>Name</td><td style="font-weight:500;">${user.name}</td><td>Age / Gender</td><td style="font-weight:500;">${user.age} / ${user.gender}</td></tr>
    <tr><td>Profession</td><td style="font-weight:500;">${user.profession}</td><td>Daily speaking</td><td style="font-weight:500;">${user.dailySpeakingHours} hrs — ${user.vocalDemands} demand</td></tr>
  </table>
</div>

<div class="score-hero">
  <div class="score-sub">VOCAL FITNESS SCORE</div>
  <div class="score">${session.vocalFitnessScore}</div>
  <div class="score-label">${scoreLabel}</div>
</div>

<h2>Aerodynamic Parameters</h2>
<div class="two-col">
  <div><div class="val" style="color:${getRatingColor(a.mptRating)}">${a.mptSeconds}s</div><div class="lbl">MPT ${ratingBadge(a.mptRating)}</div></div>
  <div><div class="val" style="color:${getRatingColor(a.szRating)}">${a.szRatio}</div><div class="lbl">S/Z Ratio ${ratingBadge(a.szRating)}</div></div>
</div>

<h2>Acoustic Parameters</h2>
<table class="data-table">
  <tr><td>Fundamental Frequency (F0)</td><td style="text-align:right;font-weight:600;color:${getRatingColor(ac.f0Rating)};">${ac.fundamentalFrequency} Hz</td><td style="text-align:right;">${ratingBadge(ac.f0Rating)}</td></tr>
  <tr><td>Jitter</td><td style="text-align:right;font-weight:600;color:${getRatingColor(ac.jitterRating)};">${ac.jitterPercent}%</td><td style="text-align:right;">${ratingBadge(ac.jitterRating)}</td></tr>
  <tr><td>Shimmer</td><td style="text-align:right;font-weight:600;color:${getRatingColor(ac.shimmerRating)};">${ac.shimmerPercent}%</td><td style="text-align:right;">${ratingBadge(ac.shimmerRating)}</td></tr>
  <tr><td>HNR</td><td style="text-align:right;font-weight:600;color:${getRatingColor(ac.hnrRating)};">${ac.hnrDb} dB</td><td style="text-align:right;">${ratingBadge(ac.hnrRating)}</td></tr>
</table>

<h2>Perceptual — GRBAS</h2>
<table class="grbas-table">
  ${grbasBar('Grade', p.grade)}
  ${grbasBar('Roughness', p.roughness)}
  ${grbasBar('Breathiness', p.breathiness)}
  ${grbasBar('Asthenia', p.asthenia)}
  ${grbasBar('Strain', p.strain)}
</table>
<p style="font-size:12px;color:#6B7280;margin-top:8px;">Total GRBAS: <strong>${p.totalScore}/15</strong></p>

${v ? `
<h2>Voice Handicap Index</h2>
<div class="two-col" style="margin-bottom:8px;">
  <div><div class="val" style="color:#42A5F5;">${v.functional}</div><div class="lbl">Functional /40</div></div>
  <div><div class="val" style="color:#A4D65E;">${v.physical}</div><div class="lbl">Physical /40</div></div>
  <div><div class="val" style="color:#FF7043;">${v.emotional}</div><div class="lbl">Emotional /40</div></div>
</div>
<p style="font-size:13px;">Total: <strong>${v.totalScore}/120</strong> — Severity: <strong>${v.severity}</strong></p>
` : ''}

${vfiSection}

<div class="disclaimer">
  <strong>Disclaimer:</strong> This report is generated by VocalFit for self-monitoring purposes and does not constitute a clinical diagnosis. Acoustic parameters are based on on-device signal processing, not instrumental analysis. Consult a certified speech-language pathologist or voice pathologist for clinical evaluation. Normative data: Ptacek & Sander (1963), Baken & Orlikoff (2000), Teixeira et al. (2013), Jacobson et al. (1997), Hirano (1981), Nanjundeswaran et al. (2015).
</div>

<div class="footer">Generated by VocalFit · ${date}</div>

</body>
</html>`;
}

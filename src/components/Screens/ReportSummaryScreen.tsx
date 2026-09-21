import { MainLogo } from '../LionCrest';
import { UserProfile, EngagementRecord, ReportRecord, TriggerEntry } from '../../types';
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  MapPin,
  Sparkles,
  Eye,
  User,
  Palette,
} from 'lucide-react';

interface ReportSummaryScreenProps {
  user: UserProfile;
  engagements: EngagementRecord[];
  onBack: () => void;
  onCreateReport: () => void;
  onViewEngagements: () => void;
  onSelectEngagement: (engagement: EngagementRecord) => void;
  startDate?: string;
  endDate?: string;
  reports?: ReportRecord[];
  generalComments?: string;
  triggerEntries?: TriggerEntry[];
}

const SUMMARY_CATEGORIES = [
  {
    category: 'Feeling',
    icon: Heart,
    getValues: (engagement: EngagementRecord) => engagement.feelings,
  },
  {
    category: 'Location',
    icon: MapPin,
    getValues: (engagement: EngagementRecord) => engagement.locations,
  },
  {
    category: 'Attire',
    icon: Sparkles,
    getValues: (engagement: EngagementRecord) => engagement.attire,
  },
  {
    category: 'Eyes Went To',
    icon: Eye,
    getValues: (engagement: EngagementRecord) => engagement.eyesWentTo,
  },
  {
    category: 'Her Body Type',
    icon: User,
    getValues: (engagement: EngagementRecord) => engagement.herBuild,
  },
  {
    category: 'Hair Color',
    icon: Palette,
    getValues: (engagement: EngagementRecord) => [engagement.hairColor],
  },
];

export function ReportSummaryScreen({
  user,
  engagements,
  onBack,
  onCreateReport,
  onViewEngagements,
  startDate = '2025-04-24',
  endDate = '2025-05-24',
  reports = [],
  generalComments = '',
  triggerEntries = [],
  onSelectEngagement,
}: ReportSummaryScreenProps) {
  const reportEngagements = engagements.filter((engagement) => {
    const timestamp = new Date(engagement.timestamp).getTime();
    const start = startDate ? new Date(`${startDate}T00:00:00`).getTime() : -Infinity;
    const end = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Infinity;
    return timestamp >= start && timestamp <= end;
  });

  const avgScore = reportEngagements.length
    ? (
        reportEngagements.reduce((acc, curr) => acc + curr.score, 0) /
        reportEngagements.length
      ).toFixed(1)
    : '0.0';

  const rankings = SUMMARY_CATEGORIES.map((category) => {
    const counts = new Map<string, number>();
    reportEngagements.forEach((engagement) => {
      category.getValues(engagement).filter(Boolean).forEach((value) => {
        counts.set(value, (counts.get(value) || 0) + 1);
      });
    });
    const topChoices = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 3)
      .map(([value]) => value);

    return { ...category, topChoices };
  });

  return (
    <div className="w-full h-full min-h-[520px] max-w-[420px] sm:max-w-[580px] mx-auto p-4 sm:p-5 flex flex-col justify-between select-none">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-1 pt-1">
          <button
            type="button"
            onClick={onBack}
            className="text-[#f1ca63] hover:text-[#fff] p-1 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>

          <h2 className="font-serif-gold text-xs sm:text-sm font-black tracking-[0.2em] text-[#f1ca63] uppercase m-0">
            REPORT SUMMARY
          </h2>

          <div className="w-5" />
        </div>

        {/* Report period */}
        <div className="text-center pb-4">
          <p className="text-[11px] sm:text-xs text-[#8c8c88] font-medium tracking-wide m-0">
            {startDate} – {endDate}
          </p>
        </div>

        {/* Report Overview Card */}
        <div className="bg-[#030814] border border-[#765b24]/60 rounded-xl p-4 flex items-center justify-between shadow-inner mb-4">
          <div className="space-y-1">
            <div className="text-[11px] text-[#8c8c88]">Name of person making report</div>
            <div className="text-sm font-bold text-[#eee]">{user.name || 'Unnamed user'}</div>
            <div className="text-[11px] text-[#8c8c88] pt-1">Average Score</div>
            <div className="font-serif-gold text-2xl font-black text-[#f1ca63] leading-none">
              {avgScore}
            </div>
            <div className="text-[10px] text-[#8c8c88] pt-1">
              {reportEngagements.length} engagement{reportEngagements.length === 1 ? '' : 's'} in period
            </div>
          </div>

          <div className="shrink-0 pl-2">
            <MainLogo size={70} glow={true} src="/header logo.png" className="w-16 h-16 object-contain" />
          </div>
        </div>

        {/* Top three choices for each report page */}
        <div className="bg-[#030814] border border-[#765b24]/60 rounded-xl overflow-hidden shadow-inner">
          <div className="overflow-x-auto w-full no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[340px] sm:min-w-0">
              <thead>
                <tr className="bg-[#0a1120] border-b border-[#765b24]/40 text-[9px] sm:text-[10px] font-bold text-[#f1ca63] uppercase tracking-wider">
                  <th className="py-2.5 px-2.5 sm:px-3 text-left">CATEGORY</th>
                  <th className="py-2.5 px-2 sm:px-2.5 text-center">MOST COMMON</th>
                  <th className="py-2.5 px-2 sm:px-2.5 text-center">SECOND</th>
                  <th className="py-2.5 px-2 sm:px-2.5 text-center">THIRD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#765b24]/20 text-[10px] sm:text-xs">
                {rankings.map((row) => {
                  const RowIcon = row.icon;
                  return (
                    <tr
                      key={row.category}
                      className="hover:bg-[#07101f] transition-colors"
                    >
                      <td className="py-2.5 px-2.5 sm:px-3 font-bold text-[#f1ca63] whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <RowIcon className="w-3.5 h-3.5 text-[#f1ca63] shrink-0" strokeWidth={1.75} />
                          {row.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 sm:px-2.5 text-center text-[#f1ca63] font-medium">
                        {row.topChoices[0] || 'None'}
                      </td>
                      <td className="py-2.5 px-2 sm:px-2.5 text-center text-[#eee]">
                        {row.topChoices[1] || '—'}
                      </td>
                      <td className="py-2.5 px-2 sm:px-2.5 text-center text-[#b9b7ad]">
                        {row.topChoices[2] || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {generalComments && (
          <div className="mt-4 bg-[#030814] border border-[#765b24]/60 rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#f1ca63] font-bold mb-1">
              General Comments / Observations
            </div>
            <p className="text-xs text-[#eee] leading-relaxed m-0">{generalComments}</p>
          </div>
        )}

        {triggerEntries.length > 0 && (
          <div className="mt-4 bg-[#030814] border border-[#765b24]/60 rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#f1ca63] font-bold mb-1">
              Logged Triggers
            </div>
            <div className="space-y-2">
              {triggerEntries.map((entry) => (
                <div key={entry.trigger} className="text-xs text-[#eee] leading-relaxed">
                  <div className="font-bold text-[#f1ca63]">{entry.trigger}</div>
                  {entry.comment && <div className="text-[#b9b7ad]">{entry.comment}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider text-[#f1ca63] font-bold">
              Engagements in report period
            </div>
            <div className="text-[10px] text-[#8c8c88]">Select one for all choices</div>
          </div>
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {reportEngagements.map((engagement) => (
              <button
                type="button"
                key={engagement.id}
                onClick={() => onSelectEngagement(engagement)}
                className="w-full bg-[#030814] border border-[#765b24]/60 hover:border-[#f1ca63] rounded-xl p-3 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <span>
                  <span className="block text-xs font-bold text-[#eee]">{engagement.dateStr}</span>
                  <span className="block text-[10px] text-[#8c8c88] mt-0.5">{engagement.timeStr}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[10px] text-[#b9b7ad]">Score {engagement.score}/4</span>
                  <ChevronRight className="w-4 h-4 text-[#f1ca63]" />
                </span>
              </button>
            ))}
            {!reportEngagements.length && (
              <div className="bg-[#030814] border border-[#765b24]/60 rounded-xl p-4 text-xs text-[#b9b7ad] text-center">
                No engagements were logged during this report period.
              </div>
            )}
          </div>
        </div>

        {reports.length > 1 && (
          <div className="mt-4 bg-[#030814] border border-[#765b24]/60 rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#f1ca63] font-bold mb-2">
              Previous Reports
            </div>
            <div className="space-y-2">
              {reports.slice(1).map((report) => (
                <div key={report.id} className="border-t border-[#765b24]/30 pt-2 first:border-t-0 first:pt-0">
                  <div className="text-xs text-[#eee]">{report.startDate} – {report.endDate}</div>
                  <div className="text-[11px] text-[#b9b7ad] mt-0.5">
                    {report.triggers.length ? report.triggers.map((entry) => entry.trigger).join(', ') : 'No triggers logged'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Report actions */}
      <div className="pt-4 pb-2">
        <button
          type="button"
          id="report-create-report-btn"
          onClick={onCreateReport}
          className="w-full mb-2 py-3 rounded-xl font-serif-gold text-xs sm:text-sm font-bold tracking-widest text-[#f1ca63] bg-[#030814] border border-[#765b24]/60 hover:border-[#f1ca63] cursor-pointer uppercase"
        >
          CREATE REPORT
        </button>
        <button
          type="button"
          id="report-view-engagements-btn"
          onClick={onViewEngagements}
          className="w-full py-3.5 rounded-xl font-serif-gold text-xs sm:text-sm font-bold tracking-widest text-[#0a0e14] bg-gradient-to-r from-[#d8a838] via-[#eec765] to-[#c9982c] hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(216,168,56,0.35)] cursor-pointer uppercase"
        >
          VIEW ALL ENGAGEMENTS
        </button>
      </div>
    </div>
  );
}

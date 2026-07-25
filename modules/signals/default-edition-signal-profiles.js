import { creatorSignalProfile } from './editions/creator-signal-profile.js';
import { frontierWorkerSignalProfile } from './editions/frontier-worker-signal-profile.js';
import { freelancerSignalProfile, smallBusinessSignalProfile } from './editions/professional-signal-profiles.js';
import { familySignalProfile, caregiverSignalProfile } from './editions/life-signal-profiles.js';
import { jobSeekerSignalProfile, studentSignalProfile } from './editions/opportunity-signal-profiles.js';

export const defaultEditionSignalProfiles = Object.freeze([
  creatorSignalProfile, frontierWorkerSignalProfile, freelancerSignalProfile, smallBusinessSignalProfile,
  familySignalProfile, caregiverSignalProfile, jobSeekerSignalProfile, studentSignalProfile
]);

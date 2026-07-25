export const jobSeekerSignalProfile = Object.freeze({
  id: 'job-seeker',
  domains: ['job-offer', 'recruiter', 'interview', 'application', 'employment-admin'],
  keywords: ['offre', 'recruteur', 'entretien', 'candidature', 'france travail', 'cv', 'poste'],
  priorityBoosts: { interview: 28, recruiter: 22, 'job-offer': 18, 'employment-admin': 20 },
  criticalPatterns: ['entretien demain', 'réponse requise', 'offre expire'],
  actionTemplates: { interview: 'Confirmer et préparer l’entretien', 'job-offer': 'Évaluer et candidater', recruiter: 'Répondre au recruteur' }
});

export const studentSignalProfile = Object.freeze({
  id: 'student',
  domains: ['course', 'exam', 'assignment', 'school-admin', 'internship'],
  keywords: ['cours', 'examen', 'devoir', 'inscription', 'stage', 'université', 'école'],
  priorityBoosts: { exam: 25, assignment: 20, 'school-admin': 18, internship: 20 },
  criticalPatterns: ['examen demain', 'date limite', 'inscription clôture'],
  actionTemplates: { exam: 'Préparer l’examen', assignment: 'Finaliser le devoir', internship: 'Répondre à l’opportunité de stage' }
});

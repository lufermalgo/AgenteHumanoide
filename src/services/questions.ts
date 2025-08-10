export interface AssessmentQuestion {
  id: string;
  text: string;
}

export async function load_questions(): Promise<AssessmentQuestion[]> {
  const resp = await fetch('/data/questions.json', { cache: 'no-store' });
  if (!resp.ok) throw new Error('No se pudo cargar preguntas');
  return (await resp.json()) as AssessmentQuestion[];
}

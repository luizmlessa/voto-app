import { z } from 'zod';

export const MetaSchema = z.object({
  id: z.string(),
  titulo: z.string().min(1),
  xp: z.number().int().min(1),
  hp: z.number().int().min(0),
  tipoDia: z.enum(['todos', 'util', 'fds']),
});
export type Meta = z.infer<typeof MetaSchema>;

export const SleepIdSchema = z.enum(['sono1', 'sono2']);
export type SleepId = z.infer<typeof SleepIdSchema>;

export const ModeSchema = z.enum(['solo', 'coop']);
export type Mode = z.infer<typeof ModeSchema>;

export const ClasseSchema = z.enum(['guerreiro', 'mago', 'ladino', 'clerigo', 'druida']).nullable().default(null);
export type Classe = z.infer<typeof ClasseSchema>;

export const DaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mode: ModeSchema,
  done: z.record(z.string(), z.boolean()).default({}),
  sleep: z.record(z.string(), z.boolean()).default({}),
  played: z.boolean().default(false),
});
export type Day = z.infer<typeof DaySchema>;

export const StateSchema = z.object({
  level: z.number().int().min(1).default(1),
  xp: z.number().int().min(0).default(0),
  hp: z.number().int().min(0).default(100),
  maxHp: z.number().int().min(1).default(100),
  mode: ModeSchema.default('solo'),
  classe: ClasseSchema,
  moedas: z.number().int().min(0).default(0),
  streak: z.number().int().min(0).default(0),
  freezes: z.number().int().min(0).default(0),
  metas: z.array(MetaSchema).default([]),
  lastDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.record(z.string(), DaySchema).default({}),
});
export type PersistedState = z.infer<typeof StateSchema>;
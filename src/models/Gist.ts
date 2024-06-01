export interface Gist {
  id: number;
  description: string;
  created_at: string;
  owner: {
    login: string;
    id: number;
  };
}

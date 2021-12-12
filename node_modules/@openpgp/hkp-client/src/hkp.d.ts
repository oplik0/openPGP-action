export class HKP {
  constructor(keyServerBaseUrl?: string);
  public lookup(options: { keyid?: string, query?: string }): Promise<string | undefined>;
}

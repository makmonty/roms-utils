export interface Dat {
  datafile: {
    game: Array<{
      $: {
        name: string;
        id: string;
        cloneofid?: string;
        cloneof?: string;
      };
      category: string[];
      description: string[];
      rom: Array<{
        $: Array<{
          name: string;
          size?: string;
          crc?: string;
          md5?: string;
          sha1?: string;
          sha256?: string;
          serial?: string;
        }>;
      }>;
    }>;
  };
}

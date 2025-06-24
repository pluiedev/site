{
  description = "Source code of pluie.me";

  inputs.nixpkgs.url = "https://channels.nixos.org/nixos-25.05/nixexprs.tar.xz";

  outputs = {
    self,
    nixpkgs,
  }: let
    forAllSystems = f: with nixpkgs.lib; genAttrs systems.flakeExposed (s: f (import nixpkgs {system = s;}));
  in {
    devShells = forAllSystems (pkgs: {
      default = pkgs.mkShell {
        buildInputs = with pkgs; [
          deno
          dprint
        ];
      };
    });
  };
}

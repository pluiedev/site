{
  description = "Source code of pluie.me";

  inputs.nixpkgs.url = "https://channels.nixos.org/nixos-25.05/nixexprs.tar.xz";

  outputs = {
    self,
    nixpkgs,
  }: let
    systems = ["x86_64-linux" "x86_64-darwin"];
    forAllSystems = f: nixpkgs.lib.genAttrs systems (s: f (import nixpkgs {system = s;}));
  in {
    devShells = forAllSystems (pkgs: {
      default = pkgs.mkShell {
        buildInputs = with pkgs; [deno];
      };
    });
  };
}

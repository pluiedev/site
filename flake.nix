{
  description = "Source code of pluie.me";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

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

{
  description = "nosqd's start page";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            nodePackages.pnpm
            docker
          ];
        };

        packages.default = self.packages.${system}.dockerCompose;

        packages.dockerCompose = pkgs.writeTextFile {
          name = "docker-compose.yml";
          text = ''
            services:
              mongodb:
                image: mongo:7
                ports:
                  - "8788:27017"
                volumes:
                  - mongodb_data:/data/db
                environment:
                  MONGO_INITDB_DATABASE: nstart
                healthcheck:
                  test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
                  interval: 5s
                  timeout: 3s
                  retries: 5

              backend:
                build:
                  context: .
                  dockerfile: Dockerfile
                ports:
                  - "8787:8787"
                environment:
                  - MONGO_URI=mongodb://mongodb:8788
                depends_on:
                  mongodb:
                    condition: service_healthy
                restart: on-failure

            volumes:
              mongodb_data:
          '';
        };
      }
    );
}

{ pkgs, ... }:

{
  packages = [ 
    pkgs.git
    pkgs.watchman
    ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    npm.enable = true;
    npm.install.enable = true;
  };

  languages.typescript.enable = true;

  env.EXPO_NO_TELEMETRY = "1";

  scripts.web.exec = "npx expo start --web";
  scripts.web-clean.exec = "npx expo start --web --clear";
  scripts.types.exec = "npx tsc --noEmit";

  enterShell = ''
    echo "Node $(node --version) · run 'web' to start"
  '';
}
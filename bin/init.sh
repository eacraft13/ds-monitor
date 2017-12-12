# Update & upgrade
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# Node
cd $HOME
sudo apt-get -y -qq install curl build-essential libssl-dev
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
nvm install node

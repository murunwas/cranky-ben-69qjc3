rm -rf lib.zip
#7z a flow.zip  ./flow -xr!node_modules 
7z a lib.zip  ./src ./mod.ts ./index.html
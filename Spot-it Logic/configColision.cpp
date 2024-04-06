#include <bits/stdc++.h>
using namespace std;

typedef vector<int> vi;

vector<vi> e;

void mirar(int n){
    for(int i=0; i<e.size(); i++){
        for(int j=i+1; j<e.size(); j++){
            int cont=0;
            for(int k=0; k<n; k++){
                for(int p=0; p<n; p++) cont+= e[i][k]==e[j][p];
            }
            if(cont!=1){
                cout<<"mal mirar\n";
                return;
            }
        }
    }
}

int main(){
    int n;
    cin>>n;
    e.assign(n*(n+1)+1, vi(n+1,0));
    for(int i=0; i<n*(n+1)+1; i++) {
        for(int j=0; j<n+1; j++) {
            cin >> e[i][j];
        }
    }
    mirar(n+1);
    
    return 0;
}
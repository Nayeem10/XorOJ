#include <bits/stdc++.h>
using namespace std;
using LL = long long;

const int N = 1E6;

mt19937 rng(random_device{}()); 
LL randomInt(LL low, LL high) { 
    uniform_int_distribution<LL> dist(low, high); 
    return dist(rng); 
} 

string generateRandomString(int length) {
    string s = "";
    string alphanum = "ACGT";
    // string alphanum = "abcdefghijklmnopqrstuvwxyz0123456789"; // [0, 25] --> alphabet, [26, 35] --> digit
    for (int i = 0; i < length; ++i) {
        s += alphanum[randomInt(0, 3)];
    }
    return s;
}

vector<int> permutation(int n){
    vector<int> p(n);
    iota(p.begin(), p.end(), 1);
    shuffle(p.begin(), p.end(), rng);
    return p;
}

int main() {
    // Grid size
    LL a = randomInt (-1E18L, +1E18L);
    LL b = randomInt (-1E18L, +1E18L);
    cout << a << ' ' << b << '\n';

    return 0;
}

#include "stdio.h"
#include <vector>
#include <string>

using namespace std;

static std::vector<string> v  {"aaa", "bbb", "ccccc", "a" };

int calc( char* ar[])
{
	printf("sizeof: %d\n", sizeof(ar)/sizeof(char*));

}
int main(int argc, char* argv[])
{

/*	static char* aaa[] = {"aaa", "bbb", "ccccc", "a" };

	printf("sizeof: %d\n", sizeof(aaa)/sizeof(char*));

	calc(aaa);
*/


printf("num elements: %d\n", v.size() );

}

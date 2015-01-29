#ifndef _FP_IF_H
#define _FP_IF_H

#ifdef __cplusplus
extern "C" {
#endif

/* We are trying to defined version here
 */

/* Format should be 
 * <major>.<minor>.<fix>
 * Major 	-> To be updated for every milestone release 
 * Minor 	-> To be updated for every internal release
 * Fix 		-> To be updted every time there is a fix
 */
#define LIBFP_VERSION						"0.6.1"

/* All success codes should come here
 */
#define LIBFP_INIT_SUCCESS					(1)
#define LIBFP_DEINIT_SUCCESS				(2)
#define LIBFP_FP_DEVICE_FOUND				(3)
#define LIBFP_FP_DEVICE_INITIALIZED			(4)
#define LIBFP_FP_ENROLLED					(5)
#define LIBFP_FP_FILE_SAVED					(6)
#define LIBFP_FP_VERIFY_MATCH				(7)
#define LIBFP_FP_VERIFY_NO_MATCH			(8)
#define LIBFP_FP_DEVICE_OPENED				(9)
#define LIBFP_DISCOVER_PRINTS_SUCCESS		(10)

/* Collect all failure/error codes here
 */
#define LIBFP_INIT_FAILURE					(-1)
#define LIBFP_DEINIT_FAILURE				(-2)
#define LIBFP_FP_DEVICE_NOT_FOUND			(-3)
#define LIBFP_FP_DEVICE_INITIALIZE_FAILED	(-4)
#define LIBFP_FP_ENROLL_FAILED				(-5)
#define LIBFP_FP_FILE_SAVE_FAILED			(-6)
#define LIBFP_FP_VERIFY_FAILED				(-7)
#define LIBFP_FP_DEVICE_OPEN_FAILED			(-9)
#define LIBFP_DISCOVER_PRINTS_FAILED		(-10)

#define LIBFP_MEMORY_ERROR					(-99)

/* Common defines needed
 */
#define TMP_FILE_STORAGE					"/tmp/default_enrolled.pgm"
#define DEFAULT_DB_PATH						"/home/app/data/fp_data/"
#define USER_DB_FILE						"user_records.csv"
#define CSV_DATA_SEPERATOR					","
#define CSV_STR_TOKEN						", "
#define USER_TMP_DB_FILE					"tmp.csv"

#define MAX_USERS							(10)
#define MAX_NAME_LENGTH						(10)

enum gender
{
	NOT_SPECIFIED	= -1,
	FEMALE 			= 0,
	MALE
};

enum action_id
{
	EN_FP_RECORD			= 0,
	EN_FP_DELETE,
	EN_FP_VERIFY
};

enum del_category
{
	EN_DEL_FINGER,
	EN_DEL_USER,
	EN_DEL_ALL_RECORDS
};

typedef struct _fp_usr_record
{
	char		user[MAX_NAME_LENGTH];
	enum gender	gen;
	char 		fp_lt;
	char		fp_li;
	char		fp_lm;
	char		fp_lr;
	char		fp_ll;
	char		fp_rt;
	char		fp_ri;
	char		fp_rm;
	char		fp_rr;
	char		fp_rl;
}fp_usr_record;

typedef struct _verified_user
{
	char		user[MAX_NAME_LENGTH];
    //char user;
	enum gender gen;
}verified_user;

int libfprint_init(void);
fp_usr_record *libfprint_fetch_user_data();
void libfprint_deinit();
int delete_user_record(char *user, enum gender gen, enum fp_finger f_id, enum del_category cat);
int verify_finger(verified_user *usr);
int enroll_finger(char *user, enum gender gen, enum fp_finger finger_id);


#ifdef __cplusplus
}
#endif

#endif /* _FP_IF_H */

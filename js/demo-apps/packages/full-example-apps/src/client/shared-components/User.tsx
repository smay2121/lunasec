import {Card, CardContent, CardHeader, Grid, Typography, Button, FormLabel, FormGroup, makeStyles} from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import {
  loadCurrentUserAPI,
  performSaveUserPropertiesAPI
} from "../dedicated-tokenizer/passport-auth-example/utils/api-facade";
import {UserModel} from "../../shared/types";
import {lunaSecDomain} from "../constants";
import {LunaSecConfigContext, SecureForm, SecureInput} from "@lunasec/react-sdk";

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing() * 2,
  },
  padding: {
    padding: theme.spacing()
  }
}))

async function loadUser(setUser, setError) {
  const currentUserResp = await loadCurrentUserAPI();
  if (currentUserResp.success) {
    setUser(currentUserResp.user);
    return;
  }
  setError(currentUserResp.error)
}

export const User: React.FunctionComponent = () => {
  const classes = useStyles({});

  const [saveSuccessful, setSaveSuccessful] = useState<boolean>(null);
  const [error, setError] = useState<string>(null);
  const [user, setUser] = useState<UserModel>(null);

  const [ssn, setSSN] = useState<string>(null);

  const persistTokens = (e) => {
    e.preventDefault();
    setSSN(e.target.value);
  }

  useEffect(() => {
    void loadUser(setUser, setError);
  }, []);

  const handleSSNChange = (e) => {
    setSSN(e.target.value);
  }

  const saveProperties = async (e) => {
    if (ssn === null) {
      setError('ssn is null');
      return;
    }

    const res = await performSaveUserPropertiesAPI({
      ssn: ssn
    });
    if (!res.success) {
      setError(JSON.stringify(res.error));
      return;
    }
    setSaveSuccessful(true);
  }

  if (user === null) {
    return (
      <Grid item xs={12}>
        <Card>
          <CardContent><p>Loading...</p></CardContent>
        </Card>
      </Grid>
    );
  }

  return (
    <Grid item xs={12}>
      {error !== null
      ? (<Card>
            <CardHeader title={'Error'} />
            <CardContent><p>{error}</p></CardContent>
          </Card>)
      : null}
      <Card>
        <CardHeader title={`User: ${user.username}`}/>
        <CardContent>
          <SecureForm name="secure-form-example" onSubmit={saveProperties}>
            <FormGroup
              className={classes.margin}
            >
              <Typography>
                Id: {user.id}
              </Typography>
            </FormGroup>
            <FormGroup className={classes.margin}>
              <FormLabel htmlFor="ssn-token-input">
                Social Security Number
              </FormLabel>
              <input
                id="ssn-token-input"
                name="ssn"
                type="text"
                onChange={handleSSNChange}
                value={user.ssn}
              />
            </FormGroup>
            <div className={classes.margin}>
              <Button
                variant="outlined"
                color="primary"
                style={{ textTransform: "none" }}
                type="submit"
              >
                Save
              </Button>
            </div>
          </SecureForm>
        </CardContent>
      </Card>
    </Grid>
  );
};

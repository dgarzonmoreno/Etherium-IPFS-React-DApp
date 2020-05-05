import React from 'react';
import EtheriumApp from '../components/EtheriumApp';
import { Grid } from 'semantic-ui-react';

const AppLayout = () => {

    return(
        <Grid centered columns={ 2 }>
            <Grid.Column centered>
                <EtheriumApp/>
            </Grid.Column>
        </Grid>
    );
}

export default AppLayout;